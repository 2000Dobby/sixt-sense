import type { Booking, Vehicle, ProtectionPackage, Addon } from "@/lib/sixtApi";

export interface BookingSummary extends Booking {
  // We can enrich this later if needed (e.g. typed fields),
  // for now it can just be Booking with optional extra keys.
}

export interface UpsellDataSource {
  /**
   * Create a new booking and return a summary.
   * In mock mode, this can generate a random id.
   */
  createBooking(): Promise<BookingSummary>;

  /**
   * Fetch an existing booking by id.
   */
  getBooking(bookingId: string): Promise<BookingSummary>;

  /**
   * Get all available vehicles for this booking.
   */
  getAvailableVehicles(bookingId: string): Promise<Vehicle[]>;

  /**
   * Get all available protection packages for this booking.
   */
  getAvailableProtections(bookingId: string): Promise<ProtectionPackage[]>;

  /**
   * Get all available addons for this booking.
   */
  getAvailableAddons(bookingId: string): Promise<Addon[]>;
}

