import type { UpsellDataSource, BookingSummary } from "./dataSource";
import type { Vehicle, ProtectionPackage, Addon } from "@/lib/sixtApi";

// Minimal demo vehicles with local image paths
// Ideally, place these images in public/images/cars/
const DEMO_VEHICLES: Vehicle[] = [
  {
    id: "demo-suv-family",
    model: "Q7",
    brand: "Audi",
    group: "SUV",
    groupType: "SUV",
    acrissCode: "XFAR",
    seats: 7,
    fuelType: "Petrol",
    transmission: "Automatic",
    imageUrl: "/images/cars/audi-q7.png",
    price: 120,
    currency: "EUR",
  } as Vehicle,
  {
    id: "demo-premium-sedan",
    model: "5 Series",
    brand: "BMW",
    group: "Sedan",
    groupType: "Premium",
    acrissCode: "PDAR",
    seats: 5,
    fuelType: "Petrol",
    transmission: "Automatic",
    imageUrl: "/images/cars/bmw-5-series.png",
    price: 105,
    currency: "EUR",
  } as Vehicle,
  {
    id: "demo-ev-compact",
    model: "ID.3",
    brand: "Volkswagen",
    group: "Compact",
    groupType: "Compact",
    acrissCode: "CCAE",
    seats: 4,
    fuelType: "EV",
    transmission: "Automatic",
    imageUrl: "/images/cars/vw-id3.png",
    price: 75,
    currency: "EUR",
  } as Vehicle,
  {
    id: "demo-convertible",
    model: "4 Series Convertible",
    brand: "BMW",
    group: "Convertible",
    groupType: "Luxury",
    acrissCode: "LTAR",
    seats: 4,
    fuelType: "Petrol",
    transmission: "Automatic",
    imageUrl: "/images/cars/bmw-4-convertible.png",
    price: 140,
    currency: "EUR",
  } as Vehicle,
  {
    id: "demo-sport-coupe",
    model: "M4 Competition",
    brand: "BMW",
    group: "Coupe",
    groupType: "Luxury",
    acrissCode: "LSAR",
    seats: 4,
    fuelType: "Petrol",
    transmission: "Automatic",
    imageUrl: "/images/cars/bmw-m4.png",
    price: 160,
    currency: "EUR",
  } as Vehicle,
  {
    id: "demo-budget-city",
    model: "Corsa",
    brand: "Opel",
    group: "Economy",
    groupType: "Economy",
    acrissCode: "ECAR",
    seats: 5,
    fuelType: "Petrol",
    transmission: "Manual",
    imageUrl: "/images/cars/opel-corsa.webp",
    price: 50,
    currency: "EUR",
  } as Vehicle,
  {
    id: "demo-van-mover",
    model: "Sprinter",
    brand: "Mercedes-Benz",
    group: "Van",
    groupType: "Special",
    acrissCode: "FKAG",
    seats: 3,
    fuelType: "Diesel",
    transmission: "Manual",
    imageUrl: "/images/cars/mb-sprinter.png",
    price: 90,
    currency: "EUR",
  } as Vehicle,
  {
    id: "demo-estate-wagon",
    model: "Passat Variant",
    brand: "Volkswagen",
    group: "Wagon",
    groupType: "Standard",
    acrissCode: "SWAR",
    seats: 5,
    fuelType: "Diesel",
    transmission: "Automatic",
    imageUrl: "/images/cars/vw-passat.webp",
    price: 85,
    currency: "EUR",
  } as Vehicle,
  {
    id: "demo-luxury-suv",
    model: "X5",
    brand: "BMW",
    group: "SUV",
    groupType: "Luxury",
    acrissCode: "LFAR",
    seats: 5,
    fuelType: "Diesel",
    transmission: "Automatic",
    imageUrl: "/images/cars/bmw-x5.png",
    price: 130,
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
  {
    id: "demo-roadside",
    name: "Roadside Assistance",
    description: "24/7 breakdown service and towing.",
    price: 8,
    currency: "EUR",
  } as ProtectionPackage,
  {
    id: "demo-interior",
    name: "Interior Protection",
    description: "Covers cleaning and minor damage to the interior.",
    price: 5,
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

function createRandomBooking(forceStartCategory?: string): BookingSummary {
  const id = `demo-${Math.random().toString(36).slice(2, 8)}`;
  
  // By default, always start with ECAR to ensure upgrade potential for everyone
  // unless specifically overridden
  const bookedCategory = forceStartCategory || "ECAR";

  const booking: BookingSummary = {
    id,
    bookedCategory,
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
    // FORCE ECAR (Opel Corsa) as starting car for consistent demos
    return createRandomBooking("ECAR");
  },

  async getBooking(bookingId: string): Promise<BookingSummary> {
    const existing = mockBookings.get(bookingId);
    if (existing) return existing;
    return createRandomBooking("ECAR");
  },

  async getAvailableVehicles(_bookingId: string): Promise<Vehicle[]> {
    return DEMO_VEHICLES;
  },

  async getAvailableProtections(_bookingId: string): Promise<ProtectionPackage[]> {
    return DEMO_PROTECTIONS;
  },

  async getAvailableAddons(_bookingId: string): Promise<Addon[]> {
    return DEMO_ADDONS;
  },
};
