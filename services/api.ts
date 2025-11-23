import { Car, UpgradeOffer } from "@/types";

// We now use our own internal API route which handles the recommendation logic
const INTERNAL_API_BASE = '/api/hack/recommendations';

export const api = {
    fetchBookingDetails: async (bookingId: string, personaId?: string): Promise<{ bookingId: string; bookedCar: Car; offer: UpgradeOffer | null }> => {
        console.log("[API] fetchBookingDetails called with:", bookingId, "persona:", personaId);
        const params = new URLSearchParams();
        if (bookingId && bookingId !== "987654321") {
            params.append("bookingId", bookingId);
        }
        if (personaId) {
            params.append("personaId", personaId);
        }
        
        console.log("[API] Fetching from:", `${INTERNAL_API_BASE}?${params.toString()}`);
        const response = await fetch(`${INTERNAL_API_BASE}?${params.toString()}`);
        if (!response.ok) {
            console.error("[API] Fetch failed:", response.status, response.statusText);
            throw new Error('Failed to fetch recommendations');
        }
        
        const data = await response.json();
        console.log("[API] Received data:", data);
        const recs = data.recommendations;

        // Helper to map backend Vehicle to frontend Car
        const mapToCar = (vehicle: any): Car => ({
            id: vehicle.id,
            model: vehicle.model || `${vehicle.brand} ${vehicle.model}`,
            licensePlate: vehicle.licensePlate || "M JP 2371",
            image: vehicle.imageUrl || vehicle.image || "/images/default-car.png", // backend uses imageUrl
            category: vehicle.groupType || vehicle.acrissCode || "Standard",
            features: vehicle.features || [], // backend might not pass features yet, check Vehicle type
            spot: "P-204" // Hardcode or random for now as it's not in API
        });

        // 1. Determine Booked Car
        let bookedCar: Car;
        
        if (recs.currentVehicle) {
            bookedCar = mapToCar(recs.currentVehicle);
        } else if (recs.bestCarOffer && recs.bestCarOffer.fromVehicle) {
            bookedCar = mapToCar(recs.bestCarOffer.fromVehicle);
        } else if (recs.carCandidates && recs.carCandidates.length > 0) {
             // Fallback: just take the "worst" or last candidate as the booked one? 
             // Or the first one if we assume the user booked a good car.
             // Let's take the last one as a conservative "current" car if no upgrade found.
             const worst = recs.carCandidates[recs.carCandidates.length - 1].vehicle;
             bookedCar = mapToCar(worst);
        } else {
            // Total fallback
            console.warn("[API] No cars found in recommendations, using static fallback.");
            bookedCar = {
                id: "fallback",
                model: "VW Golf",
                licensePlate: "M-XY 1234",
                image: "/images/cars/vw-golf.png",
                category: "Compact",
                features: [],
                spot: "P-101"
            };
        }

        // 2. Determine Offer
        let offer: UpgradeOffer | null = null;

        if (recs.bestCarOffer) {
            const upgrade = recs.bestCarOffer;
            offer = {
                id: upgrade.toVehicle.id,
                type: 'CAR_UPGRADE',
                title: upgrade.message.headline, // "Upgrade to BMW 5 Series"
                description: upgrade.message.llmExplanation || upgrade.message.formalExplanation,
                price: upgrade.priceDifference || 0, // Daily upgrade price
                car: mapToCar(upgrade.toVehicle),
                benefits: upgrade.message.bullets || []
            };
        } else if (recs.finalOffer && recs.finalOffer.type === 'protection') {
             // Map protection offer if no car upgrade
             const prot = recs.finalOffer.protection;
             const msg = recs.finalOffer.message;
             
             offer = {
                 id: prot.protection.id,
                 type: 'PROTECTION',
                 title: msg?.headline || "Recommended Protection",
                 description: msg?.llmExplanation || msg?.formalExplanation || prot.protection.name,
                 subtitle: prot.protection.name, // Use product name as subtitle/h2
                 price: prot.protection.price || 0,
                 benefits: msg?.bullets || prot.tags || []
             };
        }

        console.log("[API] Mapped bookedCar:", bookedCar);
        console.log("[API] Mapped offer:", offer);

        return {
            bookingId: data.bookingId,
            bookedCar,
            offer
        };
    },

    postUpgrade: async (bookingId: string, vehicleId: string): Promise<boolean> => {
        const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://hackatum25.sixt.io';
        
        try {
            const response = await fetch(`${API_BASE_URL}/api/booking/${bookingId}/vehicles/${vehicleId}`, {
                method: 'POST',
            });
            if (response.ok) return true;
            console.warn("Real upgrade API failed, falling back to demo success");
            return true; // Demo fallback
        } catch (e) {
            console.warn("Upgrade failed (network), falling back to demo success", e);
            return true; // Demo fallback
        }
    },

    postUnlock: async (carId: string): Promise<boolean> => {
        const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://hackatum25.sixt.io';
        try {
            const response = await fetch(`${API_BASE_URL}/api/car/unlock`, {
                method: 'POST',
            });
             if (response.ok) return true;
             console.warn("Real unlock API failed, falling back to demo success");
             return true;
        } catch (e) {
            console.warn("Unlock failed (network), falling back to demo success", e);
            return true;
        }
    }
};
