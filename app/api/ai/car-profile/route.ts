import { NextRequest, NextResponse } from "next/server";
import { generateStructuredJson } from "@/lib/vertex";
import type { Vehicle } from "@/lib/sixtApi";
import { CAR_TAGS, getCarTags, type CarTag } from "@/lib/tagging";

interface CarProfileLLMResult {
  llmTags: string[];
  headline: string;
  bullets: string[];
}

const carProfileSchema = {
  type: "object",
  properties: {
    llmTags: {
      type: "array",
      items: { type: "string" },
      description: "Extra tags from the CAR_TAGS vocabulary.",
    },
    headline: {
      type: "string",
      description: "Short upsell headline (max ~60 chars).",
    },
    bullets: {
      type: "array",
      items: { type: "string" },
      minItems: 2,
      maxItems: 3,
    },
  },
  required: ["llmTags", "headline", "bullets"],
  additionalProperties: false,
} as const;

const systemPrompt = `
You help a car rental upsell engine enrich car data.

You will receive a JSON object with:
- "vehicle": raw vehicle data (brand, model, group, seats, fuelType, etc.)
- "baseTags": tags already assigned to the vehicle
- "CAR_TAGS": the full vocabulary of allowed car tags

Your job:
1) Propose extra tags "llmTags", which:
   - Are all taken from CAR_TAGS (no other values)
   - Are not already in baseTags
2) Create a short "headline" for why this car is a good upgrade.
3) Create 2-3 "bullets" that describe benefits (space, comfort, EV, brand, etc.).

IMPORTANT:
- Only use tags that exist in CAR_TAGS.
- Return ONLY JSON following the schema.
`;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const vehicle = body?.vehicle as Vehicle | undefined;

    if (!vehicle || typeof vehicle !== "object" || !("id" in vehicle)) {
      return NextResponse.json(
        { error: "Missing or invalid 'vehicle' object." },
        { status: 400 }
      );
    }

    const baseTags = getCarTags(vehicle);

    const userPrompt = JSON.stringify({
      vehicle,
      baseTags,
      CAR_TAGS,
    });

    const { raw, parsed } = await generateStructuredJson<CarProfileLLMResult>(
      carProfileSchema,
      systemPrompt,
      userPrompt
    );

    // Clean up llmTags: subset of CAR_TAGS, exclude baseTags, dedupe
    const baseSet = new Set<string>(baseTags as string[]);
    const vocabSet = new Set<string>(CAR_TAGS as string[]);

    const llmTagsClean: CarTag[] = Array.from(
      new Set(
        (parsed.llmTags ?? []).filter(
          (tag) => vocabSet.has(tag) && !baseSet.has(tag)
        )
      )
    ) as CarTag[];

    return NextResponse.json({
      vehicle,
      baseTags,
      llmTags: llmTagsClean,
      headline: parsed.headline,
      bullets: parsed.bullets,
      raw,
    });
  } catch (err) {
    console.error("Error in /api/ai/car-profile:", err);
    return NextResponse.json(
      { error: "Failed to generate car profile", details: (err as Error).message },
      { status: 500 }
    );
  }
}

