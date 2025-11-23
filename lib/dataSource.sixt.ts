import {
  createBooking as sixtCreateBooking,
  getBooking as sixtGetBooking,
  getAvailableVehicles as sixtGetAvailableVehicles,
  getAvailableProtections as sixtGetAvailableProtections,
  getAvailableAddons as sixtGetAvailableAddons,
  type Booking,
  type Vehicle,
  type ProtectionPackage,
  type Addon,
} from "@/lib/sixtApi";

import type { UpsellDataSource, BookingSummary } from "./dataSource";

export const sixtDataSource: UpsellDataSource = {
  async createBooking(): Promise<BookingSummary> {
    const booking: Booking = await sixtCreateBooking();
    return booking as BookingSummary;
  },

  async getBooking(bookingId: string): Promise<BookingSummary> {
    const booking: Booking = await sixtGetBooking(bookingId);
    return booking as BookingSummary;
  },

  async getAvailableVehicles(bookingId: string): Promise<Vehicle[]> {
    return sixtGetAvailableVehicles(bookingId);
  },

  async getAvailableProtections(bookingId: string): Promise<ProtectionPackage[]> {
    return sixtGetAvailableProtections(bookingId);
  },

  async getAvailableAddons(bookingId: string): Promise<Addon[]> {
    return sixtGetAvailableAddons(bookingId);
  },
};

