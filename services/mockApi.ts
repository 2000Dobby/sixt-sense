import { Car, UpgradeOffer } from "@/types";

const MOCK_BOOKED_CAR: Car = {
    id: "c1",
    model: "BMW 3 Series",
    licensePlate: "M-XY 1234",
    image: "/cars/bmw3.png",
    category: "Sedan",
    transmission: "Automatic",
    features: ["Bluetooth", "Navigation", "Heated Seats"]
};

const MOCK_UPGRADE_CAR: Car = {
    id: "c2",
    model: "BMW 5 Series",
    licensePlate: "M-AB 9876",
    image: "/cars/bmw5.png",
    category: "Luxury Class",
    transmission: "Automatic",
    features: ["More legroom & comfort", "Premium sound system", "Heads-up display included"]
};

const MOCK_OFFER: UpgradeOffer = {
    id: "o1",
    type: "CAR_UPGRADE",
    title: "Special Offer",
    description: "Upgrade to Luxury Class",
    price: 15,
    car: MOCK_UPGRADE_CAR,
    benefits: MOCK_UPGRADE_CAR.features
};

export const mockApi = {
    fetchBookingDetails: async (): Promise<{ bookedCar: Car; offer: UpgradeOffer }> => {
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate delay
        return {
            bookedCar: MOCK_BOOKED_CAR,
            offer: MOCK_OFFER
        };
    },
    
    postUpgrade: async (offerId: string): Promise<boolean> => {
        await new Promise(resolve => setTimeout(resolve, 800));
        return true;
    },

    postUnlock: async (carId: string): Promise<boolean> => {
        await new Promise(resolve => setTimeout(resolve, 1500));
        return true;
    }
};
