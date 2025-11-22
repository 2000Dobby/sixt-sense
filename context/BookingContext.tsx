"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { BookingState, Car, UpgradeOffer } from '@/types';
import { mockApi } from '@/services/mockApi';

interface BookingContextType extends BookingState {
    setStep: (step: number) => void;
    loadBooking: () => Promise<void>;
    acceptUpgrade: () => Promise<void>;
    rejectUpgrade: () => void;
    unlockCar: (carOverride?: Car) => Promise<void>;
    // New Navigation/Debug functions
    isUpgradePopupOpen: boolean;
    openUpgradePopup: () => void;
    closeUpgradePopup: () => void;
    resetFlow: () => void;
    setDebugOffer: (offer: UpgradeOffer) => void;
}

const BookingContext = createContext<BookingContextType | undefined>(undefined);

export function BookingProvider({ children }: { children: ReactNode }) {
    const [state, setState] = useState<BookingState>({
        step: 1,
        bookedCar: null,
        assignedCar: null,
        availableOffer: null,
        isUnlocked: false,
        isLoading: false,
    });

    const [isUpgradePopupOpen, setIsUpgradePopupOpen] = useState(false);

    const setStep = (step: number) => {
        setState(prev => ({ ...prev, step }));
    };

    const setDebugOffer = (offer: UpgradeOffer) => {
        setState(prev => ({ ...prev, availableOffer: offer }));
    };

    const loadBooking = async () => {
        setState(prev => ({ ...prev, isLoading: true }));
        try {
            const { bookedCar, offer } = await mockApi.fetchBookingDetails();
            setState(prev => ({
                ...prev,
                bookedCar,
                assignedCar: bookedCar, // Initially assigned the booked car
                availableOffer: offer,
                isLoading: false
            }));
        } catch (error) {
            console.error("Failed to load booking", error);
            setState(prev => ({ ...prev, isLoading: false }));
        }
    };

    const acceptUpgrade = async () => {
        if (!state.availableOffer) return;
        
        setState(prev => ({ ...prev, isLoading: true }));
        try {
            const success = await mockApi.postUpgrade(state.availableOffer.id);
            if (success && state.availableOffer.car) {
                setState(prev => ({
                    ...prev,
                    assignedCar: state.availableOffer!.car!, // Assign the upgrade car
                    isLoading: false,
                    step: 3 // Move to navigation after upgrade
                }));
            }
        } catch (error) {
            console.error("Failed to upgrade", error);
            setState(prev => ({ ...prev, isLoading: false }));
        }
    };

    const rejectUpgrade = () => {
        // Just move to next step without changing assigned car
        setStep(3);
    };

    const unlockCar = async (carOverride?: Car) => {
        const carToUnlock = carOverride || state.assignedCar;
        if (!carToUnlock) return;

        setState(prev => ({ ...prev, isLoading: true }));
        try {
            const success = await mockApi.postUnlock(carToUnlock.id);
            if (success) {
                setState(prev => ({
                    ...prev,
                    isUnlocked: true,
                    isLoading: false,
                    step: 5
                }));
            }
        } catch (error) {
            console.error("Failed to unlock", error);
            setState(prev => ({ ...prev, isLoading: false }));
        }
    };

    const resetFlow = () => {
        setState(prev => ({
            ...prev,
            step: 1,
            assignedCar: prev.bookedCar, // Reset to original car
            isUnlocked: false
        }));
        setIsUpgradePopupOpen(false);
    };

    // Load booking data on mount
    useEffect(() => {
        loadBooking();
    }, []);

    return (
        <BookingContext.Provider value={{ 
            ...state, 
            setStep, 
            loadBooking, 
            acceptUpgrade, 
            rejectUpgrade, 
            unlockCar,
            isUpgradePopupOpen,
            openUpgradePopup: () => setIsUpgradePopupOpen(true),
            closeUpgradePopup: () => setIsUpgradePopupOpen(false),
            resetFlow,
            setDebugOffer
        }}>
            {children}
        </BookingContext.Provider>
    );
}

export function useBooking() {
    const context = useContext(BookingContext);
    if (context === undefined) {
        throw new Error('useBooking must be used within a BookingProvider');
    }
    return context;
}
