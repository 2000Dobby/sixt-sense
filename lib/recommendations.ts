import { buildCarUpgradeMessage, type CarUpgradeOffer } from "@/lib/messaging";
import { dataSource } from "@/lib/dataSource.current";
import { getPersonaForBooking, type Persona, type UserTag } from "@/lib/personas";
import {
  getCarTags,
  getProtectionTags,
  type CarTag,
  type ProtectionTag,
} from "@/lib/tagging";
import type { Vehicle, ProtectionPackage, Booking } from "@/lib/sixtApi";

export interface ScoredVehicle {
  vehicle: Vehicle;
  tags: CarTag[];
  matchScore: number;    // 0..1 based on tag overlap
  spaceFit: number;      // 0 or 1 (does it fit group/luggage needs?)
  ecoMatch: number;      // 0 or 1 (EV/hybrid for eco users)
  brandPremium: number;  // 0 or 1
  pricePenalty: number;  // >= 0, more = worse
  distancePenalty: number; // for now you can default to 0 if no distance info
  totalScore: number;    // final weighted score
}

export interface ScoredProtection {
  protection: ProtectionPackage;
  tags: ProtectionTag[];
  riskCoverageScore: number; // how well it covers risk
  pricePenalty: number;      // >= 0
  totalScore: number;
}

export type PrimaryOfferType = "car" | "protection" | "both" | "none";

export interface RecommendationResult {
  bookingId: string;
  booking: Booking;
  persona: Persona;
  userTags: UserTag[];
  carCandidates: ScoredVehicle[];         // sorted by totalScore desc
  protectionCandidates: ScoredProtection[]; // sorted by totalScore desc
  primaryOfferType: PrimaryOfferType;
  bestCarOffer?: CarUpgradeOffer;
}

// --- 2. Helper functions ---

// 2.1 Tag overlap
function intersectionSize<T extends string>(a: T[], b: T[]): number {
  const setB = new Set(b);
  let count = 0;
  for (const x of a) {
    if (setB.has(x)) count++;
  }
  return count;
}

function tagMatchScore(userTags: UserTag[], carTags: CarTag[]): number {
  if (userTags.length === 0) return 0;
  const overlap = intersectionSize(userTags, carTags);
  return overlap / userTags.length; // 0..1
}

// 2.2 Simple price penalty

function pricePenaltyForVehicle(
  vehicle: Vehicle,
  persona: Persona
): number {
  // Try a few plausible fields: "price", "pricePerDay", "rate", etc.
  // If none are available, return 0 and document in comments.
  let rawPrice = 0;
  
  if (typeof (vehicle as any).price === "number") {
    rawPrice = (vehicle as any).price;
  } else if (typeof (vehicle as any).pricePerDay === "number") {
    rawPrice = (vehicle as any).pricePerDay;
  }

  // If no price was found (it's still 0 and wasn't set from above),
  // we can treat it as 0 penalty or skip.
  // Note: free upgrades (price 0) are valid and good!
  if (rawPrice === undefined || rawPrice === null) return 0;
  
  // For now assume prices are relative; we just scale penalty.
  // Make budget-sensitive users more price-averse.
  const base = rawPrice / 100; // arbitrary scaling

  switch (persona.priceSensitivity) {
    case "high":
      return base * 2;
    case "medium":
      return base * 1;
    case "low":
    default:
      return base * 0.5;
  }
}

function pricePenaltyForProtection(
  protection: ProtectionPackage,
  persona: Persona
): number {
  let rawPrice = 0;
  
  if (typeof (protection as any).price === "number") {
    rawPrice = (protection as any).price;
  } else if (typeof (protection as any).pricePerDay === "number") {
    rawPrice = (protection as any).pricePerDay;
  }

  if (rawPrice === undefined || rawPrice === null) return 0;

  const base = rawPrice / 50; // different scaling if you like

  switch (persona.priceSensitivity) {
    case "high":
      return base * 2;
    case "medium":
      return base * 1;
    case "low":
    default:
      return base * 0.5;
  }
}

// 2.3 Persona-specific weights

interface VehicleScoreWeights {
  wTagMatch: number;
  wSpaceFit: number;
  wEcoMatch: number;
  wBrandPremium: number;
  wPricePenalty: number;
  wDistancePenalty: number;
}

function getVehicleScoreWeights(persona: Persona): VehicleScoreWeights {
  // base weights
  let weights: VehicleScoreWeights = {
    wTagMatch: 4,
    wSpaceFit: 3,
    wEcoMatch: 2,
    wBrandPremium: 1,
    wPricePenalty: 2,
    wDistancePenalty: 1,
  };

  // Adjust per persona:
  if (persona.groupType === "family") {
    weights.wSpaceFit += 2;          // families care a lot about space
    weights.wTagMatch += 1;
  }

  if (persona.tripPurpose === "business") {
    weights.wBrandPremium += 1;      // business travelers like premium
  }

  if (persona.ecoPreference === "wants_ev") {
    weights.wEcoMatch += 2;          // eco personas strongly prefer EV/hybrid
  }

  if (persona.priceSensitivity === "high") {
    weights.wPricePenalty += 2;      // stronger penalty on expensive cars
  }

  return weights;
}

interface ProtectionScoreWeights {
  wRiskCoverage: number;
  wPricePenalty: number;
}

function getProtectionScoreWeights(persona: Persona): ProtectionScoreWeights {
  let weights: ProtectionScoreWeights = {
    wRiskCoverage: 4,
    wPricePenalty: 2,
  };

  if (persona.riskAttitude === "risk_averse") {
    weights.wRiskCoverage += 2;
  } else if (persona.riskAttitude === "risk_taker") {
    weights.wPricePenalty += 1; // less willing to pay for coverage
  }

  return weights;
}

// --- 3. Scoring a single vehicle ---

function scoreVehicleForUser(
  persona: Persona,
  userTags: UserTag[],
  vehicle: Vehicle
): ScoredVehicle {
  const tags = getCarTags(vehicle);
  const matchScore = tagMatchScore(userTags, tags); // 0..1

  // Space Fit
  let spaceFit = 0;
  const hasSpaciousNeed = persona.groupType === "family" || userTags.includes("needs_spacious");
  const seats = vehicle.seats ?? 0;
  
  if (hasSpaciousNeed) {
    // Check specific needs for families/spacious
    if (
      (seats >= persona.groupSize) || 
      tags.includes("needs_spacious") || 
      tags.includes("7_seats") || 
      tags.includes("van") || 
      tags.includes("suv") // often good enough
    ) {
      spaceFit = 1;
    }
  } else {
    // General check: just needs to fit the group
    if (seats >= persona.groupSize) {
      spaceFit = 1;
    }
  }

  // Eco Match
  let ecoMatch = 0;
  if (
    (persona.ecoPreference === "wants_ev" || persona.ecoPreference === "likes_hybrid") &&
    (tags.includes("ev") || tags.includes("hybrid") || tags.includes("likes_eco"))
  ) {
    ecoMatch = 1;
  }

  // Brand Premium
  const brandPremium = tags.includes("premium_brand") ? 1 : 0;

  // Price Penalty
  const pricePenalty = pricePenaltyForVehicle(vehicle, persona);

  // Distance Penalty (placeholder)
  const distancePenalty = 0;

  // Weights
  const weights = getVehicleScoreWeights(persona);

  const totalScore =
    weights.wTagMatch * matchScore +
    weights.wSpaceFit * spaceFit +
    weights.wEcoMatch * ecoMatch +
    weights.wBrandPremium * brandPremium -
    weights.wPricePenalty * pricePenalty -
    weights.wDistancePenalty * distancePenalty;

  return {
    vehicle,
    tags,
    matchScore,
    spaceFit,
    ecoMatch,
    brandPremium,
    pricePenalty,
    distancePenalty,
    totalScore,
  };
}

// --- 4. Scoring a single protection package ---

function scoreProtectionForUser(
  persona: Persona,
  userTags: UserTag[],
  protection: ProtectionPackage
): ScoredProtection {
  const tags = getProtectionTags(protection);
  
  let riskCoverageScore = 0;
  if (tags.includes("full_coverage")) riskCoverageScore += 3;
  if (tags.includes("glass_protection")) riskCoverageScore += 1;
  if (tags.includes("tyre_protection")) riskCoverageScore += 1;
  if (tags.includes("roadside_assistance")) riskCoverageScore += 1;
  
  if (persona.riskAttitude === "risk_averse") {
    riskCoverageScore += 1;
  }

  const pricePenalty = pricePenaltyForProtection(protection, persona);
  const weights = getProtectionScoreWeights(persona);

  const totalScore =
    weights.wRiskCoverage * riskCoverageScore -
    weights.wPricePenalty * pricePenalty;

  return {
    protection,
    tags,
    riskCoverageScore,
    pricePenalty,
    totalScore,
  };
}

// --- 5. Primary offer type decision ---

function decidePrimaryOfferType(
  persona: Persona,
  bestCar: ScoredVehicle | undefined,
  bestProtection: ScoredProtection | undefined
): PrimaryOfferType {
  if (!bestCar && !bestProtection) return "none";
  if (bestCar && !bestProtection) return "car";
  if (!bestCar && bestProtection) return "protection";

  // Both exist
  // Heuristic:
  // If risk_averse, lean towards protection if score is good.
  // Otherwise, lean towards car if score is good.
  // If both are strong, suggest "both".
  
  // Safety check for TS, though guarded above
  if (!bestCar || !bestProtection) return "none";

  const carScore = bestCar.totalScore;
  const protScore = bestProtection.totalScore;
  
  // Thresholds for "good enough" to be recommended
  const CAR_THRESHOLD = 2.0;
  const PROT_THRESHOLD = 3.0;

  const carIsGood = carScore > CAR_THRESHOLD;
  const protIsGood = protScore > PROT_THRESHOLD;

  if (persona.riskAttitude === "risk_averse") {
    // Prioritize protection
    if (protIsGood) {
       if (carIsGood) return "both";
       return "protection";
    }
    // If protection isn't great but car is, maybe car
    if (carIsGood) return "car";
    return "none"; // neither is compelling
  } else {
    // Prioritize car (balanced or risk_taker)
    if (carIsGood) {
      if (protIsGood) return "both";
      return "car";
    }
    if (protIsGood) return "protection";
    return "none";
  }
}

// --- 6. Main function: getRecommendationsForBooking ---

export async function getRecommendationsForBooking(
  bookingId: string,
  forcePersonaId?: string,
  forceFromVehicleId?: string
): Promise<RecommendationResult> {
  // 1. Fetch booking
  const booking = await dataSource.getBooking(bookingId);

  // 2. Get persona + userTags
  const { persona, userTags } = await getPersonaForBooking(booking, forcePersonaId);

  // 3. Fetch vehicles & protections
  const vehicles = await dataSource.getAvailableVehicles(bookingId);
  const protections = await dataSource.getAvailableProtections(bookingId);

  // 4. Score vehicles
  const scoredVehicles = vehicles
    .map((v) => scoreVehicleForUser(persona, userTags, v))
    // Optional: filter out clearly bad cars
    // e.g. don't recommend tiny cars to large families if we want to be strict
    // .filter((sv) => sv.spaceFit > 0) 
    .filter((sv) => sv.totalScore > -10); // Basic sanity filter

  scoredVehicles.sort((a, b) => b.totalScore - a.totalScore);

  // 5. Score protections
  const scoredProtections = protections
    .map((p) => scoreProtectionForUser(persona, userTags, p))
    .filter((sp) => sp.totalScore > -10);

  scoredProtections.sort((a, b) => b.totalScore - a.totalScore);

  // 6. Pick top candidates
  const bestCar = scoredVehicles[0];
  const bestProtection = scoredProtections[0];

  // 7. Decide primaryOfferType
  const primaryOfferType = decidePrimaryOfferType(persona, bestCar, bestProtection);

  let bestCarOffer: CarUpgradeOffer | undefined;

  // Determine "From" Vehicle
  let fromScored: ScoredVehicle | undefined;

  if (forceFromVehicleId) {
    // Try to find in scored list first
    fromScored = scoredVehicles.find((sv) => sv.vehicle.id === forceFromVehicleId);
    
    if (!fromScored) {
      // If not in scored list (e.g. filtered out), find in raw vehicles and score it
      const rawFrom = vehicles.find((v) => v.id === forceFromVehicleId);
      if (rawFrom) {
        fromScored = scoreVehicleForUser(persona, userTags, rawFrom);
      }
    }
  }

  // Fallback if no forced vehicle or forced vehicle not found
  if (!fromScored && scoredVehicles.length > 0) {
    // naive: treat the lowest-scoring car as "current" if no explicit reserved car info.
    fromScored = scoredVehicles[scoredVehicles.length - 1];
  }

  // If we have a valid "from" vehicle, try to find a better "to" vehicle
  if (fromScored) {
    const fromVehicle = fromScored.vehicle;
    const fromTags = fromScored.tags;

    // Find best candidate that is NOT the fromVehicle
    const toScored = scoredVehicles.find((sv) => sv.vehicle.id !== fromVehicle.id);

    if (toScored) {
      const toVehicle = toScored.vehicle;
      const toTags = toScored.tags;

      // Build the upsell message (headline, bullets, explanations)
      const message = await buildCarUpgradeMessage(
        persona,
        userTags,
        fromVehicle,
        fromTags,
        toVehicle,
        toTags
      );

      bestCarOffer = {
        type: "car_upgrade",
        fromVehicle,
        toVehicle,
        fromTags,
        toTags,
        message,
        score: toScored.totalScore,
      };
    }
  }

  // 8. Return result
  return {
    bookingId,
    booking,
    persona,
    userTags,
    carCandidates: scoredVehicles,
    protectionCandidates: scoredProtections,
    primaryOfferType,
    bestCarOffer,
  };
}

