export interface Car {
    id: string;
    model: string;
    licensePlate: string;
    image: string; // URL or placeholder
    category: string; // e.g., "Sedan", "Luxury"
    transmission: string; // "Automatic", "Manual"
    features: string[];
    spot?: string;
}

export type OfferType = 'CAR_UPGRADE' | 'PROTECTION' | 'BUNDLE';

export interface UpgradeOffer {
    id: string;
    type: OfferType;
    title: string;
    description: string;
    price: number; // Daily price
    car?: Car; // If it's a car upgrade
    benefits: string[];
}

export interface BookingState {
    step: number;
    bookedCar: Car | null;
    assignedCar: Car | null; // The car the user will actually get (could be upgrade)
    availableOffer: UpgradeOffer | null;
    isUnlocked: boolean;
    isLoading: boolean;
    successMessage?: string;
}
