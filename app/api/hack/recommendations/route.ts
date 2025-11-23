import { NextRequest, NextResponse } from "next/server";
import { dataSource } from "@/lib/dataSource.current";
import { getRecommendationsForBooking } from "@/lib/recommendations";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    let bookingId = searchParams.get("bookingId");
    const personaId = searchParams.get("personaId") || undefined;
    const vehicleId = searchParams.get("vehicleId") || undefined;
    let createdNewBooking = false;

    if (!bookingId || bookingId.trim() === "") {
      // Create a new booking if one isn't provided
      const newBooking = await dataSource.createBooking();
      bookingId = newBooking.id;
      createdNewBooking = true;
    }

    const recommendations = await getRecommendationsForBooking(bookingId, personaId, vehicleId);

    return NextResponse.json({
      bookingId,
      createdNewBooking,
      recommendations,
    });
  } catch (err) {
    console.error("Error in /api/hack/recommendations:", err);
    return NextResponse.json(
      { error: "Failed to get recommendations", details: (err as Error).message },
      { status: 500 }
    );
  }
}

