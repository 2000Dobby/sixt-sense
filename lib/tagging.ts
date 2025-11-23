import type { Vehicle, ProtectionPackage, Addon } from "@/lib/sixtApi";
import type { UserTag } from "./personas";

export type CarTag = string;
export type ProtectionTag = string;
export type AddonTag = string;

// For convenience
export type Tag = UserTag | CarTag | ProtectionTag | AddonTag;

// --- Tag Vocabulary ---

export const USER_TAGS: UserTag[] = [
  "business_trip",
  "vacation_trip",
  "family_trip",
  "weekend_trip",
  "needs_spacious",
  "heavy_luggage",
  "comfort_seeker",
  "likes_eco",
  "ev_friendly",
  "tech_lover",
  "budget_sensitive",
  "price_insensitive",
  "safety_focused",
  "insurance_likely",
  "minimal_coverage",
  "wants_fast_pickup",
  "large_group",
  "brand_conscious",
  "sporty_driver"
];

export const CAR_TAGS: CarTag[] = [
  "compact",
  "sedan",
  "suv",
  "wagon",
  "van",
  "utility", // Added utility tag
  "7_seats",
  "automatic",
  "manual",
  "ev",
  "hybrid",
  "petrol",
  "diesel",
  "premium_brand",
  "mid_range_brand",
  "budget_brand",
  "sporty",
  "needs_spacious",
  "city_friendly",
  "long_distance",
  "tech_rich",
  "luxury",
  "convertible"
];

export const PROTECTION_TAGS: ProtectionTag[] = [
  "full_coverage",
  "glass_protection",
  "tyre_protection",
  "roadside_assistance",
  "young_driver_protection",
  "premium_protection",
  "budget_protection",
  "basic_coverage",
  "personal_accident",
  "theft_protection"
];

export const ADDON_TAGS: AddonTag[] = [
  "child_seat",
  "gps_navigation",
  "ski_rack",
  "extra_driver",
  "wifi",
  "snow_chains",
  "toll_service",
  "diesel_option"
];

// --- Helper ---

function uniqueTags<T extends string>(tags: T[]): T[] {
  return Array.from(new Set(tags));
}

// --- Tagging Functions ---

export function getCarTags(vehicle: Vehicle): CarTag[] {
  const tags: CarTag[] = [];

  // Normalize strings for checks
  const groupVal = vehicle.groupType || (typeof vehicle.group === 'string' ? vehicle.group : "") || "";
  const group = groupVal.toLowerCase();
  const model = (vehicle.model || "").toLowerCase();
  const brand = (vehicle.brand || "").toLowerCase();
  const fuel = (vehicle.fuelType || "").toLowerCase();
  const transmission = (vehicle.transmission || "").toLowerCase();
  const acriss = (vehicle.acrissCode || "").toLowerCase();

  // Body Type & Size
  // Combine group and groupType for broader matching
  const combinedGroup = (group + " " + (typeof vehicle.group === 'string' ? vehicle.group.toLowerCase() : "")).trim();

  if (combinedGroup.includes("suv") || acriss.includes("f") || acriss.includes("j")) tags.push("suv");
  if (combinedGroup.includes("sedan") || combinedGroup.includes("limousine")) tags.push("sedan");
  if (combinedGroup.includes("wagon") || combinedGroup.includes("estate") || acriss.includes("w")) tags.push("wagon");
  if (combinedGroup.includes("convertible") || acriss.includes("t")) tags.push("convertible");
  
  // Van / Utility Logic
  if (combinedGroup.includes("van") || combinedGroup.includes("truck") || (vehicle.seats && vehicle.seats >= 7) || acriss.startsWith("f") || acriss.startsWith("v")) {
    tags.push("van", "needs_spacious");
    if (vehicle.seats && vehicle.seats >= 7) tags.push("7_seats");

    // Utility/Commercial check
    if (
      combinedGroup.includes("panel") || 
      combinedGroup.includes("cargo") || 
      combinedGroup.includes("special") ||
      combinedGroup.includes("truck") ||
      acriss.startsWith("f") || // FKAG is typical for trucks/transporters
      acriss.startsWith("v")
    ) {
        tags.push("utility");
    }
  }
  
  if (combinedGroup.includes("compact") || combinedGroup.includes("economy") || combinedGroup.includes("mini")) {
    tags.push("compact", "city_friendly");
  }
  
  // Transmission
  if (transmission.includes("auto")) tags.push("automatic");
  if (transmission.includes("manual")) tags.push("manual");

  // Fuel & Eco
  if (fuel.includes("electric") || fuel === "ev" || fuel === "bev") {
    tags.push("ev", "likes_eco", "city_friendly");
  }
  if (fuel.includes("hybrid") || fuel === "phev") {
    tags.push("hybrid", "likes_eco");
  }
  if (fuel.includes("diesel")) tags.push("diesel", "long_distance");
  if (fuel.includes("petrol")) tags.push("petrol");

  // Brand Tiers & Luxury Check
  // Determine premium status first (via ACRISS or Brand)
  let isPremium = false;
  
  // Check ACRISS for luxury/special
  if (acriss.startsWith("l") || acriss.startsWith("x")) {
    tags.push("luxury");
    isPremium = true;
  }

  const PREMIUM_BRANDS = ["bmw", "audi", "mercedes", "mercedes-benz", "tesla", "porsche", "land rover", "jaguar", "volvo"];
  const BUDGET_BRANDS = ["dacia", "fiat", "seat", "skoda", "kia", "hyundai", "opel", "vauxhall", "ford"];

  if (PREMIUM_BRANDS.some(b => brand.includes(b))) {
    isPremium = true;
  }

  if (isPremium) {
    tags.push("premium_brand");
  } else if (BUDGET_BRANDS.some(b => brand.includes(b))) {
    tags.push("budget_brand");
  } else {
    tags.push("mid_range_brand"); // VW, Toyota, Peugeot, etc.
  }

  // Specific Features / Style
  if (model.includes("gti") || model.includes("amg") || model.includes("m sport") || model.includes("rs")) {
    tags.push("sporty");
  }

  return uniqueTags(tags);
}

export function getProtectionTags(pkg: ProtectionPackage): ProtectionTag[] {
  const tags: ProtectionTag[] = [];

  const name = (pkg.name || "").toLowerCase();
  const desc = (pkg.description || "").toLowerCase();
  
  // Coverage Types
  if (name.includes("full") || name.includes("complete") || name.includes("peace of mind")) {
    tags.push("full_coverage", "premium_protection");
  } else if (name.includes("basic") || name.includes("minimum")) {
    tags.push("basic_coverage", "budget_protection");
  }
  
  if (name.includes("glass") || desc.includes("glass") || desc.includes("windscreen")) {
    tags.push("glass_protection");
  }
  
  if (name.includes("tire") || name.includes("tyre") || desc.includes("tire") || desc.includes("tyre")) {
    tags.push("tyre_protection");
  }
  
  if (name.includes("roadside") || desc.includes("roadside")) {
    tags.push("roadside_assistance");
  }
  
  if (name.includes("young") || desc.includes("young")) {
    tags.push("young_driver_protection");
  }

  if (name.includes("theft") || desc.includes("theft")) {
    tags.push("theft_protection");
  }
  
  if (name.includes("personal") || desc.includes("personal accident")) {
    tags.push("personal_accident");
  }

  // Fallback price heuristic (only if no tier assigned yet)
  const hasTier = tags.includes("premium_protection") || tags.includes("budget_protection");

  if (!hasTier && pkg.price) {
    if (pkg.price > 20) {
      tags.push("premium_protection");
    } else if (pkg.price < 10) {
      tags.push("budget_protection");
    }
  }

  return uniqueTags(tags);
}

export function getAddonTags(addon: Addon): AddonTag[] {
  const tags: AddonTag[] = [];

  const name = (addon.name || "").toLowerCase();
  const desc = (addon.description || "").toLowerCase();

  if (name.includes("child") || name.includes("baby") || name.includes("booster") || name.includes("toddler")) {
    tags.push("child_seat");
  }
  
  if (name.includes("gps") || name.includes("nav") || desc.includes("navigation")) {
    tags.push("gps_navigation");
  }
  
  if (name.includes("ski") || desc.includes("ski")) {
    tags.push("ski_rack");
  }
  
  if (name.includes("driver") && (name.includes("extra") || name.includes("additional"))) {
    tags.push("extra_driver");
  }
  
  if (name.includes("wifi") || name.includes("internet") || name.includes("hotspot")) {
    tags.push("wifi");
  }
  
  if (name.includes("snow") || name.includes("chain")) {
    tags.push("snow_chains");
  }
  
  if (name.includes("toll")) {
    tags.push("toll_service");
  }
  
  if (name.includes("diesel") && name.includes("option")) {
    tags.push("diesel_option");
  }

  return uniqueTags(tags);
}

// --- Facade Interfaces ---

export interface TaggedVehicle {
  vehicle: Vehicle;
  tags: CarTag[];
}

export interface TaggedProtection {
  protection: ProtectionPackage;
  tags: ProtectionTag[];
}

export interface TaggedAddon {
  addon: Addon;
  tags: AddonTag[];
}

