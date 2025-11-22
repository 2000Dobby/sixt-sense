import type { Booking } from "@/lib/sixtApi";

export type TripPurpose = "business" | "vacation" | "visiting_family" | "weekend_trip" | "moving";
export type GroupType = "solo" | "couple" | "family" | "friends";
export type PreferenceLevel = "low" | "medium" | "high";
export type RiskAttitude = "risk_averse" | "balanced" | "risk_taker";
export type PriceSensitivity = "low" | "medium" | "high";

export interface Persona {
  id: string;
  label: string;         // short marketing-style name
  description: string;   // 1–2 sentences

  tripPurpose: TripPurpose;
  groupType: GroupType;
  groupSize: number;
  tripDurationDays: number;
  luggageLevel: "light" | "normal" | "a_lot";

  comfortPreference: PreferenceLevel;
  brandPreference: "none" | "likes_premium" | "must_be_premium";
  ecoPreference: "no_preference" | "likes_hybrid" | "wants_ev";
  drivingStyle: "calm" | "normal" | "sporty";
  techAffinity: PreferenceLevel;
  priceSensitivity: PriceSensitivity;

  riskAttitude: RiskAttitude;
  previousInsuranceUptake: "always" | "sometimes" | "never";
  franchiseTolerance: "low" | "medium" | "high";

  wantsFastPickup: boolean;
  language: string;      // e.g. "en", "de"
  toneOfVoice: "formal" | "casual";
}

export type UserTag = string;

// --- Hardcoded Personas ---

export const PERSONAS: Persona[] = [
  {
    id: "family_holiday_planner",
    label: "Family Holiday Planner",
    description: "Organizing the annual family vacation. Values safety and space above all else. Wants a stress-free experience.",
    tripPurpose: "vacation",
    groupType: "family",
    groupSize: 4,
    tripDurationDays: 10,
    luggageLevel: "a_lot",
    comfortPreference: "high",
    brandPreference: "none",
    ecoPreference: "no_preference",
    drivingStyle: "calm",
    techAffinity: "medium",
    priceSensitivity: "medium",
    riskAttitude: "risk_averse",
    previousInsuranceUptake: "always",
    franchiseTolerance: "low",
    wantsFastPickup: false,
    language: "en",
    toneOfVoice: "casual",
  },
  {
    id: "time_pressed_consultant",
    label: "Time-Pressed Consultant",
    description: "Traveling for business. Needs efficiency and reliability. Willing to pay for convenience and premium comfort.",
    tripPurpose: "business",
    groupType: "solo",
    groupSize: 1,
    tripDurationDays: 2,
    luggageLevel: "light",
    comfortPreference: "high",
    brandPreference: "likes_premium",
    ecoPreference: "no_preference",
    drivingStyle: "normal",
    techAffinity: "high",
    priceSensitivity: "low",
    riskAttitude: "balanced",
    previousInsuranceUptake: "sometimes",
    franchiseTolerance: "medium",
    wantsFastPickup: true,
    language: "en",
    toneOfVoice: "formal",
  },
  {
    id: "budget_backpacker",
    label: "Budget Backpacker",
    description: "Exploring on a shoestring budget. Prioritizes cost over comfort. Flexible and adventurous.",
    tripPurpose: "vacation",
    groupType: "friends",
    groupSize: 2,
    tripDurationDays: 14,
    luggageLevel: "normal",
    comfortPreference: "low",
    brandPreference: "none",
    ecoPreference: "no_preference",
    drivingStyle: "normal",
    techAffinity: "low",
    priceSensitivity: "high",
    riskAttitude: "risk_taker",
    previousInsuranceUptake: "never",
    franchiseTolerance: "high",
    wantsFastPickup: false,
    language: "en",
    toneOfVoice: "casual",
  },
  {
    id: "eco_conscious_urbanite",
    label: "Eco-Conscious Urbanite",
    description: "City dweller going on a trip. Deeply cares about sustainability and carbon footprint. Prefers modern tech.",
    tripPurpose: "visiting_family",
    groupType: "couple",
    groupSize: 2,
    tripDurationDays: 3,
    luggageLevel: "normal",
    comfortPreference: "medium",
    brandPreference: "none",
    ecoPreference: "wants_ev",
    drivingStyle: "calm",
    techAffinity: "high",
    priceSensitivity: "medium",
    riskAttitude: "balanced",
    previousInsuranceUptake: "sometimes",
    franchiseTolerance: "medium",
    wantsFastPickup: false,
    language: "en",
    toneOfVoice: "casual",
  },
  {
    id: "weekend_getaway_couple",
    label: "Weekend Getaway Couple",
    description: "Escaping the daily grind for a romantic weekend. Wants a nice car but mindful of the budget.",
    tripPurpose: "weekend_trip",
    groupType: "couple",
    groupSize: 2,
    tripDurationDays: 3,
    luggageLevel: "light",
    comfortPreference: "medium",
    brandPreference: "likes_premium",
    ecoPreference: "likes_hybrid",
    drivingStyle: "normal",
    techAffinity: "medium",
    priceSensitivity: "medium",
    riskAttitude: "balanced",
    previousInsuranceUptake: "sometimes",
    franchiseTolerance: "medium",
    wantsFastPickup: true,
    language: "en",
    toneOfVoice: "casual",
  },
  {
    id: "luxury_enthusiast",
    label: "Luxury Enthusiast",
    description: "Wants to drive the best cars available. Price is not an object. Values status, performance, and premium features.",
    tripPurpose: "vacation",
    groupType: "solo",
    groupSize: 1,
    tripDurationDays: 5,
    luggageLevel: "normal",
    comfortPreference: "high",
    brandPreference: "must_be_premium",
    ecoPreference: "no_preference",
    drivingStyle: "sporty",
    techAffinity: "high",
    priceSensitivity: "low",
    riskAttitude: "risk_taker",
    previousInsuranceUptake: "always", // Buys full coverage to protect the expensive asset
    franchiseTolerance: "low",
    wantsFastPickup: true,
    language: "en",
    toneOfVoice: "formal",
  },
  {
    id: "digital_nomad",
    label: "Digital Nomad",
    description: "Working remotely while traveling. Needs a reliable car with good tech (connectivity) and long-term comfort.",
    tripPurpose: "business", // or mixed
    groupType: "solo",
    groupSize: 1,
    tripDurationDays: 30,
    luggageLevel: "a_lot", // Tech gear + personal items
    comfortPreference: "medium",
    brandPreference: "none",
    ecoPreference: "likes_hybrid",
    drivingStyle: "normal",
    techAffinity: "high",
    priceSensitivity: "medium",
    riskAttitude: "balanced",
    previousInsuranceUptake: "sometimes",
    franchiseTolerance: "medium",
    wantsFastPickup: false,
    language: "en",
    toneOfVoice: "casual",
  },
  {
    id: "sports_team_organizer",
    label: "Sports Team Organizer",
    description: "Driving a small group to a tournament or event. Needs maximum space for people and gear.",
    tripPurpose: "weekend_trip",
    groupType: "friends",
    groupSize: 7,
    tripDurationDays: 3,
    luggageLevel: "a_lot",
    comfortPreference: "low",
    brandPreference: "none",
    ecoPreference: "no_preference",
    drivingStyle: "normal",
    techAffinity: "low",
    priceSensitivity: "medium",
    riskAttitude: "balanced",
    previousInsuranceUptake: "always", // Safety for the group
    franchiseTolerance: "low",
    wantsFastPickup: false,
    language: "en",
    toneOfVoice: "casual",
  },
  {
    id: "relocating_mover",
    label: "Relocating Mover",
    description: "Moving apartments or transporting large items. Needs a van or large utility vehicle. Purely functional.",
    tripPurpose: "moving",
    groupType: "solo",
    groupSize: 1,
    tripDurationDays: 1,
    luggageLevel: "a_lot",
    comfortPreference: "low",
    brandPreference: "none",
    ecoPreference: "no_preference",
    drivingStyle: "calm", // Careful with cargo
    techAffinity: "low",
    priceSensitivity: "high",
    riskAttitude: "risk_averse", // Worried about scratching the rental
    previousInsuranceUptake: "always",
    franchiseTolerance: "low",
    wantsFastPickup: true,
    language: "en",
    toneOfVoice: "casual",
  },
  {
    id: "retired_explorers",
    label: "Retired Explorers",
    description: "Senior couple enjoying a leisurely road trip. Values comfort, ease of use, and clear navigation.",
    tripPurpose: "vacation",
    groupType: "couple",
    groupSize: 2,
    tripDurationDays: 12,
    luggageLevel: "normal",
    comfortPreference: "high",
    brandPreference: "likes_premium",
    ecoPreference: "no_preference",
    drivingStyle: "calm",
    techAffinity: "low",
    priceSensitivity: "medium",
    riskAttitude: "risk_averse",
    previousInsuranceUptake: "always",
    franchiseTolerance: "low",
    wantsFastPickup: false,
    language: "en", // or local language
    toneOfVoice: "formal",
  }
];

// --- Tagging Logic ---

export function getUserTagsFromPersona(persona: Persona): UserTag[] {
  const tags: UserTag[] = [];

  // Trip Purpose
  if (persona.tripPurpose === "business") tags.push("business_trip");
  if (persona.tripPurpose === "vacation") tags.push("vacation_trip");
  if (persona.tripPurpose === "weekend_trip") tags.push("weekend_trip");

  // Group Type & Size
  if (persona.groupType === "family") {
    tags.push("family_trip");
    tags.push("needs_spacious");
  }
  if (persona.groupSize >= 5) tags.push("large_group");

  // Luggage
  if (persona.luggageLevel === "a_lot") tags.push("heavy_luggage");

  // Comfort & Brand
  if (persona.comfortPreference === "high") tags.push("comfort_seeker");
  if (persona.brandPreference === "must_be_premium" || persona.brandPreference === "likes_premium") {
    tags.push("brand_conscious");
  }

  // Eco Preference
  if (persona.ecoPreference === "wants_ev") {
    tags.push("likes_eco", "ev_friendly");
  } else if (persona.ecoPreference === "likes_hybrid") {
    tags.push("likes_eco");
  }

  // Price Sensitivity
  if (persona.priceSensitivity === "high") tags.push("budget_sensitive");
  if (persona.priceSensitivity === "low") tags.push("price_insensitive");

  // Tech Affinity
  if (persona.techAffinity === "high") tags.push("tech_lover");

  // Risk Attitude
  if (persona.riskAttitude === "risk_averse") {
    tags.push("safety_focused", "insurance_likely");
  } else if (persona.riskAttitude === "risk_taker") {
    tags.push("minimal_coverage");
  }

  // Other Preferences
  if (persona.wantsFastPickup) tags.push("wants_fast_pickup");
  if (persona.drivingStyle === "sporty") tags.push("sporty_driver");

  // Deduplicate just in case
  return Array.from(new Set(tags));
}

// --- Persona Selection ---

export interface PersonaWithTags {
  persona: Persona;
  userTags: UserTag[];
}

import { getBooking } from "@/lib/sixtApi";

export async function getPersonaForBooking(bookingOrId: Booking | string, forcePersonaId?: string): Promise<PersonaWithTags> {
  let booking: Booking;

  if (typeof bookingOrId === "string") {
    try {
      booking = await getBooking(bookingOrId);
    } catch (error) {
      console.error("Failed to fetch booking for persona selection, using fallback.", error);
      // Fallback: Create a dummy booking object or handle error gracefully
      // For now, we'll treat it as an empty booking to proceed with random selection
      booking = { id: bookingOrId };
    }
  } else {
    booking = bookingOrId;
  }

  // Simple heuristics to choose a persona
  let selectedPersona: Persona | undefined;

  // 1. Check if a specific persona was requested
  if (forcePersonaId) {
    selectedPersona = PERSONAS.find(p => p.id === forcePersonaId);
    if (!selectedPersona) {
      console.warn(`Requested persona ID "${forcePersonaId}" not found. Falling back to default.`);
      selectedPersona = PERSONAS[0];
    }
  }

  // 2. If no forced persona (and thus no selectedPersona yet), try heuristics
  if (!selectedPersona) {
    // Try to infer from booking details if available
    // Note: 'start' and 'end' are not strictly typed in the base Booking interface but might exist in the API response
    const startTime = booking.start ? new Date(booking.start as string).getTime() : 0;
    const endTime = booking.end ? new Date(booking.end as string).getTime() : 0;
    const durationDays = (endTime - startTime) / (1000 * 60 * 60 * 24);
    
    // Helper to pick random
    const randomPick = <T>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)];

    if (durationDays > 5) {
       // Long trip -> likely Family or Backpacker
       selectedPersona = randomPick([
         PERSONAS.find(p => p.id === "family_holiday_planner")!,
         PERSONAS.find(p => p.id === "budget_backpacker")!
       ]);
    } else if (durationDays > 0 && durationDays <= 2) {
      // Short trip
      const isWeekday = booking.start ? new Date(booking.start as string).getDay() >= 1 && new Date(booking.start as string).getDay() <= 5 : false;
      
      if (isWeekday) {
        // Weekday short trip -> Consultant
        selectedPersona = PERSONAS.find(p => p.id === "time_pressed_consultant")!;
      } else {
         // Weekend short trip -> Weekend Couple or Eco Urbanite
         selectedPersona = randomPick([
          PERSONAS.find(p => p.id === "weekend_getaway_couple")!,
          PERSONAS.find(p => p.id === "eco_conscious_urbanite")!
         ]);
      }
    } else {
      // Fallback: purely random if no signals
      selectedPersona = randomPick(PERSONAS);
    }
  }
  
  // Safety fallback if logic failed
  if (!selectedPersona) selectedPersona = PERSONAS[0];

  return {
    persona: selectedPersona,
    userTags: getUserTagsFromPersona(selectedPersona)
  };
}

