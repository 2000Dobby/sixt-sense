import { Car, UpgradeOffer } from "@/types";

const MOCK_BOOKED_CAR: Car = {
    id: "c1",
    model: "BMW 3 Series",
    licensePlate: "M-XY 1234",
    image: "/cars/bmw3.png",
    category: "Sedan",
    transmission: "Automatic",
    features: ["Bluetooth", "Navigation", "Heated Seats"],
    spot: "Spot: #123"
};

const MOCK_UPGRADE_CAR: Car = {
    id: "c2",
    model: "BMW 5 Series",
    licensePlate: "M-AB 9876",
    image: "/cars/bmw5.png",
    category: "Luxury Class",
    transmission: "Automatic",
    features: ["More legroom & comfort", "Premium sound system", "Heads-up display included"],
    spot: "Spot: #423"
};

const MOCK_OFFER_CAR: UpgradeOffer = {
    id: "o1",
    type: "CAR_UPGRADE",
    title: "Vehicle Upgrade",
    description: "Upgrade to Luxury Class",
    price: 15,
    car: MOCK_UPGRADE_CAR,
    benefits: ["More legroom", "Premium Sound", "Heads-up Display"]
};

const MOCK_OFFER_PROTECTION: UpgradeOffer = {
    id: "o2",
    type: "PROTECTION",
    title: "Peace of Mind",
    description: "Full Protection Package",
    price: 10,
    benefits: ["0€ Deductible", "Tire & Glass Protection", "Personal Accident Protection"]
};

export const mockOffers = {
    car: MOCK_OFFER_CAR,
    protection: MOCK_OFFER_PROTECTION
};

export const mockApi = {
    fetchBookingDetails: async (): Promise<{ bookedCar: Car; offer: UpgradeOffer }> => {
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate delay
        return {
            bookedCar: MOCK_BOOKED_CAR,
            offer: MOCK_OFFER_CAR
        };
    },
    
    postUpgrade: async (offerId: string): Promise<boolean> => {
        await new Promise(resolve => setTimeout(resolve, 800));
        return true;
    },

    postUnlock: async (carId: string): Promise<boolean> => {
        await new Promise(resolve => setTimeout(resolve, 500));
        return true;
    }
};
