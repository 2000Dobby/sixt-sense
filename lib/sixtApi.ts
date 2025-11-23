const SIXT_BASE_URL = process.env.SIXT_BASE_URL ?? "https://hackatum25.sixt.io";

/**
 * Helper function to perform fetch requests to the Sixt API.
 */
async function sixtFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const url = `${SIXT_BASE_URL}${path}`;
  
  const res = await fetch(url, {
    ...options,
    cache: 'no-store',
  });

  if (!res.ok) {
    let errorMessage = res.statusText;
    try {
      const errorBody = await res.json();
      errorMessage = JSON.stringify(errorBody);
    } catch {
      // fallback
    }
    throw new Error(`Sixt API Error: ${res.status} ${errorMessage}`);
  }

  if (res.status === 204) {
    return {} as T;
  }

  const text = await res.text();
  return text ? JSON.parse(text) : ({} as T);
}

// --- Interfaces ---

export interface Booking {
  id: string;
  status?: string;
  bookedCategory?: string;
  selectedVehicle?: Vehicle | null; // Might be a vehicle object or id
  createdAt?: string;
  [key: string]: unknown;
}

export interface Vehicle {
  id: string;
  brand: string;
  model: string;
  acrissCode?: string;
  imageUrl?: string;
  transmission?: string;
  fuelType?: string;
  seats?: number;
  bags?: number;
  price?: number; // Daily price
  currency?: string;
  groupType?: string;
  [key: string]: unknown;
}

export interface ProtectionPackage {
  id: string;
  name: string;
  description?: string;
  price: number; // Daily price
  currency: string;
  deductibleAmount?: number;
  ratingStars?: number;
  includes?: { title: string; description: string }[];
  excludes?: { title: string; description: string }[];
  [key: string]: unknown;
}

export interface Addon {
  id: string;
  name: string;
  description?: string;
  price: number;
  currency: string;
  selected?: boolean;
  [key: string]: unknown;
}

// --- Internal Response Types ---

interface VehiclesResponse {
  reservationId: string;
  deals: Array<{
    vehicle: {
      id: string;
      brand: string;
      model: string;
      acrissCode: string;
      images: string[];
      bagsCount: number;
      passengersCount: number;
      groupType: string;
      tyreType: string;
      transmissionType: string;
      fuelType: string;
      attributes: Array<{ key: string; value: string }>;
      [key: string]: any;
    };
    pricing: {
      displayPrice: { currency: string; amount: number };
      totalPrice: { currency: string; amount: number };
    };
    [key: string]: any;
  }>;
}

interface ProtectionsResponse {
  protectionPackages: Array<{
    id: string;
    name: string;
    description?: string;
    price: {
      displayPrice: { currency: string; amount: number };
    };
    deductibleAmount?: { value: number };
    ratingStars?: number;
    includes?: any[];
    excludes?: any[];
    [key: string]: any;
  }>;
}

interface AddonsResponse {
  addons: Array<{
    id: number; // Category ID
    name: string;
    options: Array<{
      chargeDetail: {
        id: string;
        title: string;
        description?: string;
        [key: string]: any;
      };
      additionalInfo: {
        price: {
          displayPrice: { currency: string; amount: number };
        };
        isSelected?: boolean;
        [key: string]: any;
      };
    }>;
  }>;
}

// --- API Functions ---

export async function createBooking(): Promise<Booking> {
  return sixtFetch<Booking>('/api/booking', {
    method: 'POST',
  });
}

export async function getBooking(bookingId: string): Promise<Booking> {
  return sixtFetch<Booking>(`/api/booking/${bookingId}`);
}

export async function getAvailableVehicles(bookingId: string): Promise<Vehicle[]> {
  const data = await sixtFetch<VehiclesResponse>(`/api/booking/${bookingId}/vehicles`);
  
  if (!data.deals) return [];

  return data.deals.map(deal => ({
    id: deal.vehicle.id,
    brand: deal.vehicle.brand,
    model: deal.vehicle.model,
    acrissCode: deal.vehicle.acrissCode,
    imageUrl: deal.vehicle.images?.[0],
    transmission: deal.vehicle.transmissionType,
    fuelType: deal.vehicle.fuelType,
    seats: deal.vehicle.passengersCount,
    bags: deal.vehicle.bagsCount,
    groupType: deal.vehicle.groupType,
    price: deal.pricing?.displayPrice?.amount,
    currency: deal.pricing?.displayPrice?.currency,
    // preserve original objects if needed
    ...deal.vehicle
  }));
}

export async function getAvailableProtections(bookingId: string): Promise<ProtectionPackage[]> {
  const data = await sixtFetch<ProtectionsResponse>(`/api/booking/${bookingId}/protections`);
  
  if (!data.protectionPackages) return [];

  return data.protectionPackages.map(pkg => ({
    id: pkg.id,
    name: pkg.name,
    description: pkg.description,
    price: pkg.price?.displayPrice?.amount ?? 0,
    currency: pkg.price?.displayPrice?.currency ?? 'EUR',
    deductibleAmount: pkg.deductibleAmount?.value,
    ratingStars: pkg.ratingStars,
    includes: pkg.includes,
    excludes: pkg.excludes,
  }));
}

export async function getAvailableAddons(bookingId: string): Promise<Addon[]> {
  const data = await sixtFetch<AddonsResponse>(`/api/booking/${bookingId}/addons`);
  
  if (!data.addons) return [];

  // Flatten the categories -> options structure
  const flatAddons: Addon[] = [];

  for (const category of data.addons) {
    if (category.options) {
      for (const opt of category.options) {
        flatAddons.push({
          id: opt.chargeDetail.id,
          name: opt.chargeDetail.title,
          description: opt.chargeDetail.description,
          price: opt.additionalInfo?.price?.displayPrice?.amount ?? 0,
          currency: opt.additionalInfo?.price?.displayPrice?.currency ?? 'EUR',
          selected: opt.additionalInfo?.isSelected,
          categoryName: category.name // unexpected bonus field
        });
      }
    }
  }

  return flatAddons;
}

export async function assignVehicleToBooking(bookingId: string, vehicleId: string): Promise<Booking> {
  return sixtFetch<Booking>(`/api/booking/${bookingId}/vehicles/${vehicleId}`, {
    method: 'POST',
  });
}

export async function assignProtectionToBooking(bookingId: string, packageId: string): Promise<Booking> {
  return sixtFetch<Booking>(`/api/booking/${bookingId}/protections/${packageId}`, {
    method: 'POST',
  });
}

export async function completeBooking(bookingId: string): Promise<Booking> {
  return sixtFetch<Booking>(`/api/booking/${bookingId}/complete`, {
    method: 'POST',
  });
}

export async function lockCar(): Promise<void> {
  await sixtFetch<unknown>('/api/car/lock', {
    method: 'POST',
  });
}

export async function unlockCar(): Promise<void> {
  await sixtFetch<unknown>('/api/car/unlock', {
    method: 'POST',
  });
}

export async function blinkCar(): Promise<void> {
  await sixtFetch<unknown>('/api/car/blink', {
    method: 'POST',
  });
}

/**
 * Sixt HackaTUM API client.
 * Import these functions in server-side code only (route handlers, server components, server actions).
 * Example:
 *   import { getBooking } from "@/lib/sixtApi";
 */
