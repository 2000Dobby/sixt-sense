import { NextResponse } from 'next/server';
import { createBooking, getBooking, getAvailableVehicles, getAvailableProtections, getAvailableAddons } from '@/lib/sixtApi';

export async function GET() {
  try {
    // 1. Create Booking
    const booking = await createBooking();

    if (!booking || !booking.id) {
      return NextResponse.json({ error: 'Failed to create booking or no ID returned', raw: booking }, { status: 500 });
    }

    const id = booking.id;

    // 2. Fetch details in parallel
    const [
      bookingDetails,
      vehicles,
      protections,
      addons
    ] = await Promise.all([
      getBooking(id),
      getAvailableVehicles(id),
      getAvailableProtections(id),
      getAvailableAddons(id)
    ]);

    return NextResponse.json({
      step1_create: booking,
      step2_details: bookingDetails,
      step3_vehicles: vehicles,
      step4_protections: protections,
      step5_addons: addons
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message, stack: error.stack }, { status: 500 });
  }
}

