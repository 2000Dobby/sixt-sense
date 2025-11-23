import { Car, UpgradeOffer } from "@/types";

const MOCK_BOOKED_CAR: Car = {
    id: "1a1257a0-e495-43ff-b213-9786338e159b",
    model: "VOLKSWAGEN GOLF",
    licensePlate: "M-XY 7890",
    image: "https://vehicle-pictures-prod.orange.sixt.com/143707/9d9d9c/18_1.png",
    category: "SEDAN",
    features: ["Automatic", "5 Seats", "Petrol"],
    spot: "Spot: #123"
};

const MOCK_UPGRADE_CAR: Car = {
    id: "afc8d944-b855-4a80-bace-360c43e08411",
    model: "SKODA ENYAQ",
    licensePlate: "M-AB 4567",
    image: "https://vehicle-pictures-prod.orange.sixt.com/142547/ffffff/18_1.png",
    category: "SUV",
    features: ["Automatic", "5 Seats", "Electric", "New vehicle", "Built-in navigation"],
    spot: "Spot: #423"
};

const MOCK_OFFER_CAR: UpgradeOffer = {
    id: "o1",
    type: "CAR_UPGRADE",
    title: "Special offer",
    description: "Upgrade to Skoda Enyaq",
    price: 15,
    car: MOCK_UPGRADE_CAR,
    benefits: ["Electric", "Built-in navigation", "New vehicle"]
};

const MOCK_OFFER_PROTECTION: UpgradeOffer = {
    id: "1002182",
    type: "PROTECTION",
    title: "Special offer",
    description: "Peace of Mind Protection",
    subtitle: "Travel with total confidence. The Peace of Mind package gives you full protection for both your rental vehicle and everyone inside it, so you can focus entirely on enjoying the journey. With $0 deductible, comprehensive coverage, and extended support, it’s the easiest way to stay protected on the road.",
    price: 69.32,
    benefits: [
        "Loss Damage Waiver",
        "Supplemental Liability Insurance",
        "Personal Property Coverage",
        "Personal Accident Coverage",
        "Extended Roadside Protection"
    ]
};

export const mockOffers = {
    car: MOCK_OFFER_CAR,
    protection: MOCK_OFFER_PROTECTION
};

export const mockApi = {
    fetchBookingDetails: async (): Promise<{ bookingId: string; bookedCar: Car; offer: UpgradeOffer }> => {
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate delay
        return {
            bookingId: "987654321",
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
