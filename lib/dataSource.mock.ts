import type { UpsellDataSource, BookingSummary } from "./dataSource";
import type { Vehicle, ProtectionPackage, Addon } from "@/lib/sixtApi";

// Minimal demo vehicles
const DEMO_VEHICLES: Vehicle[] = [
  {
    id: "demo-suv-family",
    model: "Q7",
    brand: "Audi",
    group: "SUV",
    seats: 7,
    fuelType: "Petrol",
    transmission: "Automatic",
    imageUrl: "https://www.sixt.com/fileadmin/files/global/user_upload/fleet/png/350x200/audi-q7-5d-grau-2020.png",
    price: 120,
    currency: "EUR",
  } as Vehicle,
  {
    id: "demo-premium-sedan",
    model: "5 Series",
    brand: "BMW",
    group: "Sedan",
    seats: 5,
    fuelType: "Petrol",
    transmission: "Automatic",
    imageUrl: "https://www.sixt.com/fileadmin/files/global/user_upload/fleet/png/350x200/bmw-5er-limousine-4d-schwarz-2020.png",
    price: 105,
    currency: "EUR",
  } as Vehicle,
  {
    id: "demo-ev-compact",
    model: "ID.3",
    brand: "Volkswagen",
    group: "Compact",
    seats: 4,
    fuelType: "EV",
    transmission: "Automatic",
    imageUrl: "https://www.sixt.com/fileadmin/files/global/user_upload/fleet/png/350x200/vw-id3-5d-weiss-2020.png",
    price: 75,
    currency: "EUR",
  } as Vehicle,
  {
    id: "demo-convertible",
    model: "4 Series Convertible",
    brand: "BMW",
    group: "Convertible",
    seats: 4,
    fuelType: "Petrol",
    transmission: "Automatic",
    imageUrl: "https://www.sixt.com/fileadmin/files/global/user_upload/fleet/png/350x200/bmw-4er-cabrio-2d-schwarz-2021.png",
    price: 140,
    currency: "EUR",
  } as Vehicle,
];

const DEMO_PROTECTIONS: ProtectionPackage[] = [
  {
    id: "demo-full-coverage-plus",
    name: "Full Coverage Plus",
    description: "Zero deductible, includes glass & tyre protection, roadside assistance.",
    price: 35,
    currency: "EUR",
  } as ProtectionPackage,
  {
    id: "demo-basic-protection",
    name: "Basic Protection",
    description: "Reduced deductible for major damage.",
    price: 15,
    currency: "EUR",
  } as ProtectionPackage,
  {
    id: "demo-glass-tyre",
    name: "Glass & Tyre Protection",
    description: "Covers damage to windscreen and tyres.",
    price: 10,
    currency: "EUR",
  } as ProtectionPackage,
];

const DEMO_ADDONS: Addon[] = [
  {
    id: "demo-child-seat",
    name: "Child Seat",
    description: "Safety seat for children up to 4 years.",
    price: 12,
    currency: "EUR",
  } as Addon,
  {
    id: "demo-gps",
    name: "GPS Navigation",
    description: "Satellite navigation system.",
    price: 8,
    currency: "EUR",
  } as Addon,
  {
    id: "demo-wifi",
    name: "Mobile Wi-Fi",
    description: "Unlimited data hotspot.",
    price: 10,
    currency: "EUR",
  } as Addon,
];

const mockBookings = new Map<string, BookingSummary>();

function createRandomBooking(): BookingSummary {
  const id = `demo-${Math.random().toString(36).slice(2, 8)}`;
  const booking: BookingSummary = {
    id,
    // Simulate real fields
    pickupLocation: "HackaTUM Campus",
    durationDays: 3,
    status: "booking",
    createdAt: new Date().toISOString(),
  } as BookingSummary;
  mockBookings.set(id, booking);
  return booking;
}

export const mockDataSource: UpsellDataSource = {
  async createBooking(): Promise<BookingSummary> {
    return createRandomBooking();
  },

  async getBooking(bookingId: string): Promise<BookingSummary> {
    const existing = mockBookings.get(bookingId);
    if (existing) return existing;
    // If unknown id, just create a new booking for convenience
    return createRandomBooking();
  },

  async getAvailableVehicles(_bookingId: string): Promise<Vehicle[]> {
    // For now, we ignore bookingId and always return the same demo set
    return DEMO_VEHICLES;
  },

  async getAvailableProtections(_bookingId: string): Promise<ProtectionPackage[]> {
    return DEMO_PROTECTIONS;
  },

  async getAvailableAddons(_bookingId: string): Promise<Addon[]> {
    return DEMO_ADDONS;
  },
};

