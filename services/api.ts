import { Car, UpgradeOffer } from "@/types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://hackatum25.sixt.io';

export const api = {
    fetchBookingDetails: async (bookingId: string): Promise<{ bookingId: string; bookedCar: Car; offer: UpgradeOffer }> => {
        // 1. Get Booking Details
        const bookingResponse = await fetch(`${API_BASE_URL}/api/booking/${bookingId}`);
        if (!bookingResponse.ok) throw new Error('Failed to fetch booking details');
        // const bookingData = await bookingResponse.json(); // Not used directly for car details anymore

        // 2. Get Available Vehicles (Upgrades)
        const vehiclesResponse = await fetch(`${API_BASE_URL}/api/booking/${bookingId}/vehicles`);
        if (!vehiclesResponse.ok) throw new Error('Failed to fetch available vehicles');
        const vehiclesData = await vehiclesResponse.json();

        // Helper to map API vehicle to internal Car type
        const mapToCar = (vehicle: any): Car => ({
            id: vehicle.id,
            model: `${vehicle.brand} ${vehicle.model}`,
            licensePlate: "M-XY " + Math.floor(1000 + Math.random() * 9000), // Placeholder as API doesn't return license plate
            image: vehicle.images?.[0] || "/images/default-car.png",
            category: vehicle.groupType || vehicle.acrissCode || "Standard",
            features: vehicle.attributes?.map((a: any) => a.title) || [],
        });

        // Find the booked car (dealInfo === "BOOKED_CATEGORY")
        const bookedDeal = vehiclesData.deals?.find((d: any) => d.dealInfo === "BOOKED_CATEGORY") || vehiclesData.deals?.[0];
        
        const bookedCar: Car = bookedDeal ? mapToCar(bookedDeal.vehicle) : {
            id: "fallback",
            model: "Unknown Vehicle",
            licensePlate: "M-XY 1234",
            image: "/images/default-car.png",
            category: "Standard",
            features: [],
        };

        // Find an upgrade offer (dealInfo !== "BOOKED_CATEGORY")
        // Prefer "DISCOUNT" or just the first available upgrade
        const upgradeDeal = vehiclesData.deals?.find((d: any) => d.dealInfo !== "BOOKED_CATEGORY" && d.pricing?.displayPrice?.amount > 0);

        const offer: UpgradeOffer = upgradeDeal ? {
            id: upgradeDeal.vehicle.id,
            type: 'CAR_UPGRADE',
            title: `Upgrade to ${upgradeDeal.vehicle.brand} ${upgradeDeal.vehicle.model}`,
            description: `Experience our ${upgradeDeal.vehicle.groupType} class`,
            price: upgradeDeal.pricing.displayPrice.amount,
            car: mapToCar(upgradeDeal.vehicle),
            benefits: upgradeDeal.vehicle.upsellReasons?.length > 0 
                ? upgradeDeal.vehicle.upsellReasons 
                : ["Premium Experience", "Better Performance"] // Fallback benefits
        } : {
            id: "no-offer",
            type: 'CAR_UPGRADE',
            title: "No upgrades available",
            description: "",
            price: 0,
            benefits: []
        };

        return {
            bookingId: bookingId,
            bookedCar,
            offer
        };
    },

    postUpgrade: async (bookingId: string, vehicleId: string): Promise<boolean> => {
        const response = await fetch(`${API_BASE_URL}/api/booking/${bookingId}/vehicles/${vehicleId}`, {
            method: 'POST',
        });
        return response.ok;
    },

    postUnlock: async (carId: string): Promise<boolean> => {
        // The Postman collection uses a global unlock endpoint
        const response = await fetch(`${API_BASE_URL}/api/car/unlock`, {
            method: 'POST',
        });
        return response.ok;
    }
};

