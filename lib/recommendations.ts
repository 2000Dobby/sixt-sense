import { 
  buildCarUpgradeMessage, 
  buildProtectionUpgradeMessage,
  type CarUpgradeOffer, 
  type ProtectionUpgradeOffer 
} from "@/lib/messaging";
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
  categoryMatch: number; // 0..1 based on idealCategory overlap
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

export type FinalOffer =
  | { type: "car"; car: ScoredVehicle }
  | { type: "protection"; protection: ScoredProtection }
  | { type: "none"; reason: string };

export interface RecommendationResult {
  bookingId: string;
  booking: Booking;
  persona: Persona;
  userTags: UserTag[];
  carCandidates: ScoredVehicle[];         // sorted by totalScore desc
  protectionCandidates: ScoredProtection[]; // sorted by totalScore desc
  primaryOfferType: PrimaryOfferType;
  bestCarOffer?: CarUpgradeOffer;
  bestProtectionOffer?: ProtectionUpgradeOffer;
  finalOffer: FinalOffer;
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

// Helper to parse ACRISS code (e.g. "LFAR" -> "L")
function getCategoryCode(vehicle: Vehicle): string | undefined {
  if (vehicle.acrissCode && vehicle.acrissCode.length > 0) {
    return vehicle.acrissCode.charAt(0).toUpperCase();
  }
  // Fallback: try to infer from groupType if ACRISS is missing
  // This is heuristic and less precise
  if (vehicle.groupType) {
    const g = vehicle.groupType.toLowerCase();
    if (g.includes("luxury")) return "L";
    if (g.includes("premium")) return "P";
    if (g.includes("full")) return "F";
    if (g.includes("standard")) return "S";
    if (g.includes("intermediate")) return "I";
    if (g.includes("compact")) return "C";
    if (g.includes("economy")) return "E";
    if (g.includes("mini")) return "M";
    if (g.includes("suv") || g.includes("special")) return "X";
  }
  return undefined;
}

function categoryMatchScore(vehicle: Vehicle, persona: Persona): number {
  if (!persona.idealCategory || persona.idealCategory.length === 0) return 0;
  const carCat = getCategoryCode(vehicle);
  if (!carCat) return 0;
  
  return persona.idealCategory.includes(carCat) ? 1 : 0;
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
  wCategoryMatch: number;
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
    wCategoryMatch: 3, // New weight for category fit
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

// 2.4 Persona Biases for Final Decision

function getPersonaCarBias(persona: Persona): number {
  let b = 0;

  // Car upgrade appeal
  if (persona.comfortPreference === "high") b += 0.8;
  if (persona.brandPreference === "likes_premium") b += 0.5;
  if (persona.brandPreference === "must_be_premium") b += 1.0;
  if (persona.tripPurpose === "business") b += 0.5;

  // Eco preference can make EV/hybrid upgrades more appealing in general
  if (persona.ecoPreference === "wants_ev") b += 0.3;

  // Price sensitivity reduces willingness to upgrade car
  if (persona.priceSensitivity === "high") {
    b -= 1.0;
  } else if (persona.priceSensitivity === "medium") {
    b -= 0.4;
  }

  return b;
}

function getPersonaProtectionBias(persona: Persona): number {
  let b = 0;

  // Risk attitude and insurance history
  if (persona.riskAttitude === "risk_averse") b += 1.0;
  else if (persona.riskAttitude === "balanced") b += 0.3;
  else if (persona.riskAttitude === "risk_taker") b -= 0.3;

  if (persona.previousInsuranceUptake === "always") b += 0.7;
  else if (persona.previousInsuranceUptake === "never") b -= 0.5;

  if (persona.franchiseTolerance === "low") b += 0.5; // hates high deductibles

  // Price sensitivity also affects protections, but weaker than car upgrades
  if (persona.priceSensitivity === "high") {
    b -= 0.3;
  } else if (persona.priceSensitivity === "medium") {
    b -= 0.1;
  }

  return b;
}

// --- 3. Scoring a single vehicle ---

export function scoreVehicleForUser(
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
  // If persona wants EV, they prefer "ev" over "hybrid"
  if (persona.ecoPreference === "wants_ev") {
    if (tags.includes("ev")) ecoMatch = 1.0;
    else if (tags.includes("hybrid")) ecoMatch = 0.5; // acceptable but not ideal
  } 
  // If persona specifically likes hybrid (maybe range anxiety), they might prefer hybrid or EV
  else if (persona.ecoPreference === "likes_hybrid") {
     if (tags.includes("hybrid")) ecoMatch = 1.0;
     else if (tags.includes("ev")) ecoMatch = 0.8; // EV is also good
     else if (tags.includes("likes_eco")) ecoMatch = 0.5;
  }

  // Brand Premium
  const brandPremium = tags.includes("premium_brand") ? 1 : 0;

  // Category Match
  const categoryMatch = categoryMatchScore(vehicle, persona);

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
    weights.wBrandPremium * brandPremium +
    weights.wCategoryMatch * categoryMatch -
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
    categoryMatch,
    totalScore,
  };
}

// --- 4. Scoring a single protection package ---

export function scoreProtectionForUser(
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

function decideFinalOffer(
  persona: Persona,
  bestCar: ScoredVehicle | undefined,
  offerScoreCar: number,
  carOk: boolean,
  bestProtection: ScoredProtection | undefined,
  offerScoreProtection: number,
  protectionOk: boolean
): FinalOffer {
  if (!carOk && !protectionOk) {
    return {
      type: "none",
      reason: "No suitable car upgrade or protection offer found for this trip.",
    };
  }

  if (carOk && !protectionOk && bestCar) {
    return { type: "car", car: bestCar };
  }

  if (!carOk && protectionOk && bestProtection) {
    return { type: "protection", protection: bestProtection };
  }

  // Both car and protection are acceptable → tie-break
  if (bestCar && bestProtection) {
    // If one is clearly better, pick it
    const EPS = 0.2; // tie-break margin
    if (offerScoreCar > offerScoreProtection + EPS) {
      return { type: "car", car: bestCar };
    }
    if (offerScoreProtection > offerScoreCar + EPS) {
      return { type: "protection", protection: bestProtection };
    }

    // Scores are very similar → use persona to break ties
    if (persona.riskAttitude === "risk_averse") {
      return { type: "protection", protection: bestProtection };
    }
    if (persona.tripPurpose === "business") {
      return { type: "car", car: bestCar };
    }

    // Default: prefer car upgrade
    return { type: "car", car: bestCar };
  }

  // Fallbacks (should rarely be hit)
  if (bestCar && carOk) {
    return { type: "car", car: bestCar };
  }
  if (bestProtection && protectionOk) {
    return { type: "protection", protection: bestProtection };
  }

  return {
    type: "none",
    reason: "No consistent recommendation could be derived.",
  };
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

  // 7. Decide primaryOfferType (Legacy)
  const primaryOfferType = decidePrimaryOfferType(persona, bestCar, bestProtection);

  // --- New Final Offer Logic ---
  const personaCarBias = getPersonaCarBias(persona);
  const personaProtectionBias = getPersonaProtectionBias(persona);

  const rawCarScore = bestCar ? bestCar.totalScore : -Infinity;
  const rawProtectionScore = bestProtection ? bestProtection.totalScore : -Infinity;

  const offerScoreCar = rawCarScore + personaCarBias;
  const offerScoreProtection = rawProtectionScore + personaProtectionBias;

  const MIN_SCORE = 0.5;
  const carOk = offerScoreCar >= MIN_SCORE;
  const protectionOk = offerScoreProtection >= MIN_SCORE;

  const finalOffer = decideFinalOffer(
    persona,
    bestCar,
    offerScoreCar,
    carOk,
    bestProtection,
    offerScoreProtection,
    protectionOk
  );

  let bestCarOffer: CarUpgradeOffer | undefined;
  let bestProtectionOffer: ProtectionUpgradeOffer | undefined;

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
    // Try to find a vehicle from the booked category (first letter of ACRISS)
    const bookedCategory = booking.bookedCategory ? booking.bookedCategory.charAt(0).toUpperCase() : undefined;
    
    if (bookedCategory) {
      // Filter vehicles matching the booked category
      const categoryVehicles = scoredVehicles.filter(sv => {
        const code = getCategoryCode(sv.vehicle);
        return code === bookedCategory;
      });

      if (categoryVehicles.length > 0) {
        // Pick the WORST scoring vehicle from the booked category
        // scoredVehicles is sorted desc, so filter preserves order? 
        // actually we want the one with lowest score.
        // Since scoredVehicles is sorted desc, the last one in categoryVehicles is the worst.
        fromScored = categoryVehicles[categoryVehicles.length - 1];
      }
    }

    // If still no fromScored (no booked category info or no matching vehicles), fallback to worst overall
    if (!fromScored) {
      fromScored = scoredVehicles[scoredVehicles.length - 1];
    }
  }

  // If we have a valid "from" vehicle, try to find a better "to" vehicle
  if (fromScored) {
    const fromVehicle = fromScored.vehicle;
    const fromTags = fromScored.tags;
    const fromPrice = (fromVehicle as any).price || (fromVehicle as any).pricePerDay || 0;

    // Find best candidate that:
    // 1. Is NOT the fromVehicle
    // 2. Costs strictly MORE than the fromVehicle
    // 3. Has a better score (implicit if we pick from top of sorted list)
    const toScored = scoredVehicles.find((sv) => {
      if (sv.vehicle.id === fromVehicle.id) return false;
      
      const toPrice = (sv.vehicle as any).price || (sv.vehicle as any).pricePerDay || 0;
      
      // Enforce strict price upgrade
      // The user explicitly requested "it should just cost more" rather than strict category ranking
      if (toPrice <= fromPrice) return false;

      // Ensure it's actually a better match/score
      return sv.totalScore > fromScored!.totalScore;
    });

    if (toScored) {
      const toVehicle = toScored.vehicle;
      const toTags = toScored.tags;
      // Re-calculate or retrieve toPrice if scope is lost (although it was defined in .find() callback, that scope is closed)
      const toPrice = (toVehicle as any).price || (toVehicle as any).pricePerDay || 0;

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
        priceDifference: toPrice - fromPrice, // <--- Calculate difference here
      };
    }
  }

  // Prepare Best Protection Offer (always compute if available, for UI display)
  if (bestProtection) {
    const message = await buildProtectionUpgradeMessage(
      persona,
      userTags,
      bestProtection.protection,
      bestProtection.tags
    );
    
    bestProtectionOffer = {
      type: "protection_upgrade",
      protection: bestProtection.protection,
      tags: bestProtection.tags,
      message,
      score: bestProtection.totalScore,
      priceDifference: bestProtection.protection.price // Assuming base is 0 or this is total add-on cost
    };
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
    bestProtectionOffer,
    finalOffer,
  };
}
