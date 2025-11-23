import { NextRequest, NextResponse } from "next/server";
import { generateStructuredJson } from "@/lib/vertex";
import {
  type Persona,
  type UserTag,
  getUserTagsFromPersona,
} from "@/lib/personas";

// JSON schema for Persona structured output (matching Persona interface)
const personaSchema = {
  type: "object",
  properties: {
    id: { type: "string", description: "slug like dynamic_family_trip_1" },
    label: { type: "string" },
    description: { type: "string" },
    tripPurpose: {
      type: "string",
      enum: ["business", "vacation", "visiting_family", "weekend_trip", "moving"],
    },
    groupType: {
      type: "string",
      enum: ["solo", "couple", "family", "friends"],
    },
    groupSize: { type: "integer" },
    tripDurationDays: { type: "integer" },
    luggageLevel: {
      type: "string",
      enum: ["light", "normal", "a_lot"],
    },
    comfortPreference: {
      type: "string",
      enum: ["low", "medium", "high"],
    },
    brandPreference: {
      type: "string",
      enum: ["none", "likes_premium", "must_be_premium"],
    },
    ecoPreference: {
      type: "string",
      enum: ["no_preference", "likes_hybrid", "wants_ev"],
    },
    drivingStyle: {
      type: "string",
      enum: ["calm", "normal", "sporty"],
    },
    techAffinity: {
      type: "string",
      enum: ["low", "medium", "high"],
    },
    priceSensitivity: {
      type: "string",
      enum: ["low", "medium", "high"],
    },
    riskAttitude: {
      type: "string",
      enum: ["risk_averse", "balanced", "risk_taker"],
    },
    previousInsuranceUptake: {
      type: "string",
      enum: ["always", "sometimes", "never"],
    },
    franchiseTolerance: {
      type: "string",
      enum: ["low", "medium", "high"],
    },
    wantsFastPickup: { type: "boolean" },
    language: { type: "string", description: "ISO language code e.g. en, de" },
    toneOfVoice: {
      type: "string",
      enum: ["formal", "casual"],
    },
    idealCategory: {
      type: "array",
      items: { type: "string" },
      description: "List of ACRISS category first letters suitable for this persona (e.g. ['F', 'P', 'L'] for a luxury traveler). Valid codes: M (Mini), E (Economy), C (Compact), I (Intermediate), S (Standard), F (Full-size), P (Premium), L (Luxury), X (Special/SUV).",
    },
  },
  required: [
    "id",
    "label",
    "description",
    "tripPurpose",
    "groupType",
    "groupSize",
    "tripDurationDays",
    "luggageLevel",
    "comfortPreference",
    "brandPreference",
    "ecoPreference",
    "drivingStyle",
    "techAffinity",
    "priceSensitivity",
    "riskAttitude",
    "previousInsuranceUptake",
    "franchiseTolerance",
    "wantsFastPickup",
    "language",
    "toneOfVoice",
  ],
  additionalProperties: false,
} as const;

const systemPrompt = `
You are a service that converts a natural-language description of a car rental customer
and their trip into a structured Persona object for an upsell engine.

Follow the JSON schema exactly. Use only the allowed enum values where provided.
Keep 'label' short and 'description' to 1-2 sentences.

When populating 'idealCategory', consider the group size, luggage, comfort preference, and trip purpose.
- 'M', 'E', 'C' are good for budget/solo/small groups.
- 'I', 'S', 'F' are good for comfort/families.
- 'P', 'L' are for premium/luxury/business.
- 'X' is for SUVs, Vans, or Special needs (moving).
`;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const prompt = body?.prompt;

    if (typeof prompt !== "string" || prompt.trim().length === 0) {
      return NextResponse.json(
        { error: "Missing or invalid 'prompt' string." },
        { status: 400 }
      );
    }

    const { raw, parsed } = await generateStructuredJson<Persona>(
      personaSchema,
      systemPrompt,
      prompt
    );

    const persona = parsed;
    // Re-calculate user tags based on the generated persona properties
    // This ensures the tags are consistent with our logic
    const userTags: UserTag[] = getUserTagsFromPersona(persona);

    return NextResponse.json({ persona, userTags, raw });
  } catch (err) {
    console.error("Error in /api/ai/persona:", err);
    return NextResponse.json(
      { error: "Failed to generate persona", details: (err as Error).message },
      { status: 500 }
    );
  }
}
