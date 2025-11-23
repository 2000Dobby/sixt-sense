import type { Persona, UserTag } from "@/lib/personas";
import type { Vehicle, ProtectionPackage } from "@/lib/sixtApi";
import type { CarTag, ProtectionTag } from "@/lib/tagging";
import { getGeminiModel } from "@/lib/vertex";

export interface UpsellMessage {
  type: "car_upgrade" | "protection";
  headline: string;
  bullets: string[];          // short bullet points, max 3
  stat?: string;              // optional supporting stat

  // Explanations:
  formalExplanation: string;  // rule-based, deterministic
  llmExplanation?: string;    // refined by Vertex AI (if available)
}

export interface CarUpgradeOffer {
  type: "car_upgrade";
  fromVehicle: Vehicle;
  toVehicle: Vehicle;
  fromTags: CarTag[];
  toTags: CarTag[];
  message: UpsellMessage;
  score?: number;             // optional, can be wired from ScoredVehicle.totalScore later
  priceDifference?: number; // <--- Add this field
}

function getVehicleDisplayName(vehicle: Vehicle): string {
  const anyVehicle = vehicle as any;
  // Try a few common fields first
  return (
    (typeof anyVehicle.name === "string" && anyVehicle.name) ||
    (typeof anyVehicle.model === "string" && anyVehicle.model) ||
    (typeof anyVehicle.description === "string" && anyVehicle.description) ||
    vehicle.id
  );
}

// --- 2) Formal, rule-based explanation (CAR) ---

export function buildCarUpgradeExplanationFormal(
  persona: Persona,
  userTags: UserTag[],
  fromVehicle: Vehicle,
  fromTags: CarTag[],
  toVehicle: Vehicle,
  toTags: CarTag[]
): string {
  const reasons: string[] = [];

  const fromSet = new Set(fromTags);
  const toSet = new Set(toTags);
  const addedTags = [...toSet].filter((t) => !fromSet.has(t));

  const hasUserTag = (tag: UserTag) => userTags.includes(tag);
  const hasAdded = (tag: CarTag) => addedTags.includes(tag);

  // 1) Space / seats / luggage
  if (hasAdded("needs_spacious") || hasAdded("7_seats")) {
    if (persona.groupType === "family" || hasUserTag("family_trip")) {
      reasons.push("more space for your family and luggage");
    } else {
      reasons.push("extra room for passengers and luggage");
    }
  }

  // 2) Eco / EV / hybrid
  if (hasAdded("ev") || hasAdded("hybrid")) {
    if (persona.ecoPreference === "wants_ev" || hasUserTag("likes_eco")) {
      reasons.push("a more eco-friendly drive that matches your preferences");
    } else {
      reasons.push("a more environmentally friendly driving option");
    }
  }

  // 3) Comfort / premium brand
  if (hasAdded("premium_brand")) {
    if (persona.tripPurpose === "business") {
      reasons.push("a more premium, comfortable experience for your business trip");
    } else {
      reasons.push("a more comfortable and premium driving experience");
    }
  }

  // 4) Tech / infotainment
  if (hasAdded("tech_rich") || hasUserTag("tech_lover")) {
    reasons.push("more modern in-car technology like navigation and infotainment");
  }

  // 5) City vs long-distance
  if (hasAdded("city_friendly") && persona.tripPurpose !== "business") {
    reasons.push("an easier car to handle in city traffic and tight parking spots");
  }
  if (hasAdded("long_distance")) {
    reasons.push("more comfort for longer distances");
  }

  // Fallback if nothing specific triggered
  if (reasons.length === 0) {
    reasons.push("a better match for your trip and preferences");
  }

  const mainReason = reasons[0];
  const secondaryReason = reasons[1];

  const fromName = getVehicleDisplayName(fromVehicle);
  const toName = getVehicleDisplayName(toVehicle);

  let sentence = "";

  // Intro depending on persona
  if (persona.groupType === "family") {
    sentence += `For your family trip, ${toName} offers ${mainReason}`;
  } else if (persona.tripPurpose === "business") {
    sentence += `For your business trip, ${toName} offers ${mainReason}`;
  } else if (persona.tripPurpose === "vacation") {
    sentence += `For your vacation, ${toName} offers ${mainReason}`;
  } else {
    sentence += `For your journey, ${toName} offers ${mainReason}`;
  }

  if (secondaryReason) {
    sentence += ` and also gives you ${secondaryReason}.`;
  } else {
    sentence += ".";
  }

  // Optionally reference the previous car if it’s different
  if (fromName !== toName) {
    sentence += ` Compared to ${fromName}, it is simply a better fit for this trip.`;
  }

  return sentence;
}

// --- 2.5) Formal, rule-based explanation (PROTECTION) ---

export function buildProtectionExplanationFormal(
    persona: Persona,
    userTags: UserTag[],
    protection: ProtectionPackage,
    protectionTags: ProtectionTag[]
  ): string {
    const reasons: string[] = [];
  
    const hasTag = (tag: ProtectionTag) => protectionTags.includes(tag);
  
    if (hasTag("roadside_assistance")) {
        if (persona.tripPurpose === "business") {
            reasons.push("guaranteed reliability so you never miss a meeting");
        } else {
            reasons.push("peace of mind on the road with 24/7 assistance");
        }
    }
  
    if (hasTag("glass_protection") || hasTag("tyre_protection")) {
        if (persona.drivingStyle === "sporty") {
            reasons.push("coverage for tyres and glass, letting you enjoy the drive worry-free");
        } else {
            reasons.push("protection against common minor damages like glass chips or flat tyres");
        }
    }
  
    if (hasTag("full_coverage")) {
        if (persona.riskAttitude === "risk_averse" || persona.groupType === "family") {
            reasons.push("maximum safety and zero deductible for a completely stress-free trip");
        } else {
            reasons.push("comprehensive coverage so you have zero liability");
        }
    }

    if (protection.name.toLowerCase().includes("interior")) {
        if (persona.tripPurpose === "moving") {
            reasons.push("worry-free transport without stressing about scratches or spills inside");
        } else {
            reasons.push("coverage for any accidental damage to the vehicle interior");
        }
    }
  
    if (reasons.length === 0) {
      reasons.push("essential protection for your trip");
    }
  
    const mainReason = reasons[0];
  
    if (persona.tripPurpose === "moving") {
        return `Since you are moving, this package offers ${mainReason}.`;
    } else if (persona.tripPurpose === "business") {
        return `To ensure a smooth business trip, this protection provides ${mainReason}.`;
    } else if (persona.groupType === "family") {
        return `For your family's safety, this coverage ensures ${mainReason}.`;
    }
  
    return `For your peace of mind, this package provides ${mainReason}.`;
  }

// --- 3) Vertex AI (Gemini) integration ---

// Using the existing helper from lib/vertex.ts instead of creating a new client instance manually
// This ensures consistent auth and project configuration.
const DEFAULT_VERTEX_MODEL_ID = process.env.VERTEX_MODEL_ID ?? "gemini-2.5-flash";

export async function refineCarUpgradeExplanationWithLLM(
  persona: Persona,
  userTags: UserTag[],
  fromVehicle: Vehicle,
  fromTags: CarTag[],
  toVehicle: Vehicle,
  toTags: CarTag[],
  formalExplanation: string
): Promise<string> {
  // We'll use the existing getGeminiModel helper
  // If USE_VERTEX_LLM is explicitly false, we skip
  if (process.env.USE_VERTEX_LLM === "false") {
    return formalExplanation;
  }

  const personaSummary = [
    `Label: ${persona.label}`,
    `Trip purpose: ${persona.tripPurpose}`,
    `Group: ${persona.groupType} (size ${persona.groupSize})`,
    `Price sensitivity: ${persona.priceSensitivity}`,
    `Risk attitude: ${persona.riskAttitude}`,
  ].join("; ");

  const userTagsSummary = userTags.length ? userTags.join(", ") : "none";
  const fromName = getVehicleDisplayName(fromVehicle);
  const toName = getVehicleDisplayName(toVehicle);
  const fromTagsSummary = fromTags.length ? fromTags.join(", ") : "none";
  const toTagsSummary = toTags.length ? toTags.join(", ") : "none";

  const prompt = [
    "You are helping a rental car customer understand why an upgrade is a better fit.",
    "",
    "Customer persona:",
    personaSummary,
    "",
    `User tags: ${userTagsSummary}`,
    "",
    `Current car: ${fromName}`,
    `Current car tags: ${fromTagsSummary}`,
    "",
    `Suggested upgrade: ${toName}`,
    `Suggested car tags: ${toTagsSummary}`,
    "",
    "Internal reasoning (for your reference, do not mention explicitly):",
    formalExplanation,
    "",
    "Task: Write 1–2 short, friendly sentences explaining to the customer why the suggested car is a better match than the current one.",
    "- Do not mention 'tags', 'persona', or 'internal reasoning'.",
    "- Do not add disclaimers or mention that you are an AI.",
    "- Do not invent details that are not implied by the tags.",
    "- Focus on space, comfort, eco-friendliness, and trip fit, not price.",
    "- Return only the sentences, no bullet points, no quotes around them.",
  ].join("\n");

  try {
    // Use the project's standard Vertex helper
    const model = getGeminiModel(DEFAULT_VERTEX_MODEL_ID);
    
    const result = await model.generateContent(prompt);
    const text = result.response?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (typeof text === "string" && text.trim().length > 0) {
      return text.trim();
    }
  } catch (err) {
    console.error("Error calling Vertex AI for explanation refinement:", err);
  }

  // Fallback
  return formalExplanation;
}

export async function refineProtectionExplanationWithLLM(
    persona: Persona,
    userTags: UserTag[],
    protection: ProtectionPackage,
    protectionTags: ProtectionTag[],
    formalExplanation: string
  ): Promise<string> {
    if (process.env.USE_VERTEX_LLM === "false") {
      return formalExplanation;
    }
  
    const personaSummary = [
      `Label: ${persona.label}`,
      `Trip purpose: ${persona.tripPurpose}`,
      `Risk attitude: ${persona.riskAttitude}`,
      `Driving style: ${persona.drivingStyle}`,
    ].join("; ");
  
    const tagsSummary = protectionTags.join(", ");
    
    const prompt = [
      "You are helping a rental car customer understand why a protection package is recommended.",
      "",
      "Customer persona:",
      personaSummary,
      "",
      `Protection Package: ${protection.name}`,
      `Description: ${protection.description}`,
      `Protection Tags: ${tagsSummary}`,
      "",
      "Internal reasoning:",
      formalExplanation,
      "",
      "Task: Write 1–2 short, friendly sentences explaining why this protection is smart for this specific customer's trip.",
      "- Focus on peace of mind, safety, or convenience relevant to their trip type (e.g. moving, business, family).",
      "- Do not mention 'persona' or technical tags.",
      "- Keep it concise and natural.",
    ].join("\n");
  
    try {
      const model = getGeminiModel(DEFAULT_VERTEX_MODEL_ID);
      const result = await model.generateContent(prompt);
      const text = result.response?.candidates?.[0]?.content?.parts?.[0]?.text;
  
      if (typeof text === "string" && text.trim().length > 0) {
        return text.trim();
      }
    } catch (err) {
      console.error("Error calling Vertex AI for protection explanation:", err);
    }
  
    return formalExplanation;
  }

// --- 4) Build a full car-upgrade message ---

export async function buildCarUpgradeMessage(
  persona: Persona,
  userTags: UserTag[],
  fromVehicle: Vehicle,
  fromTags: CarTag[],
  toVehicle: Vehicle,
  toTags: CarTag[]
): Promise<UpsellMessage> {
  const formalExplanation = buildCarUpgradeExplanationFormal(
    persona,
    userTags,
    fromVehicle,
    fromTags,
    toVehicle,
    toTags
  );

  const llmExplanation = await refineCarUpgradeExplanationWithLLM(
    persona,
    userTags,
    fromVehicle,
    fromTags,
    toVehicle,
    toTags,
    formalExplanation
  );

  const toName = getVehicleDisplayName(toVehicle);

  // Simple heuristic for a headline based on persona and tags
  let headline = `A better fit for your trip`;
  if (persona.groupType === "family") {
    headline = `More space and comfort for your family`;
  } else if (persona.tripPurpose === "business") {
    headline = `Arrive more relaxed and in comfort`;
  } else if (persona.ecoPreference === "wants_ev") {
    headline = `Make your trip greener with ${toName}`;
  }

  const bullets: string[] = [];

  // Basic bullets from tags (keep them short)
  if (toTags.includes("needs_spacious") || toTags.includes("7_seats")) {
    bullets.push("More space for passengers and luggage");
  }
  if (toTags.includes("ev") || toTags.includes("hybrid")) {
    bullets.push("Lower-emission driving option");
  }
  if (toTags.includes("premium_brand")) {
    bullets.push("Premium driving comfort and feel");
  }
  if (toTags.includes("tech_rich")) {
    bullets.push("Modern in-car tech and navigation");
  }

  // Ensure we have at least one bullet
  if (bullets.length === 0) {
    bullets.push("Better aligned with your trip needs");
  }

  // Trim to max 3 bullets
  const trimmedBullets = bullets.slice(0, 3);

  const stat =
    persona.groupType === "family"
      ? "Most families on longer trips choose a more spacious car."
      : persona.tripPurpose === "business"
      ? "Many business travelers upgrade for extra comfort and quiet."
      : "Customers with similar trips often choose this category.";

  return {
    type: "car_upgrade",
    headline,
    bullets: trimmedBullets,
    stat,
    formalExplanation,
    llmExplanation,
  };
}

export async function buildProtectionMessage(
    persona: Persona,
    userTags: UserTag[],
    protection: ProtectionPackage,
    protectionTags: ProtectionTag[]
): Promise<UpsellMessage> {
    const formalExplanation = buildProtectionExplanationFormal(
        persona,
        userTags,
        protection,
        protectionTags
    );

    const llmExplanation = await refineProtectionExplanationWithLLM(
        persona,
        userTags,
        protection,
        protectionTags,
        formalExplanation
    );

    let headline = "Recommended for your trip";
    if (persona.tripPurpose === "moving") headline = "Protect your move";
    else if (persona.tripPurpose === "business") headline = "Travel without worries";
    else if (persona.groupType === "family") headline = "Maximum safety for your family";

    const bullets: string[] = [];
    if (protectionTags.includes("roadside_assistance")) bullets.push("24/7 Roadside Assistance");
    if (protectionTags.includes("glass_protection")) bullets.push("Glass & Windscreen Cover");
    if (protectionTags.includes("tyre_protection")) bullets.push("Tyre Damage Cover");
    if (protectionTags.includes("full_coverage")) bullets.push("Zero Deductible");

    if (bullets.length === 0) bullets.push("Essential Coverage");

    return {
        type: "protection",
        headline,
        bullets: bullets.slice(0, 3),
        formalExplanation,
        llmExplanation
    };
}
