"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { BookingState, Car, UpgradeOffer } from '@/types';
import { mockApi } from '@/services/mockApi';

interface BookingContextType extends BookingState {
    setStep: (step: number) => void;
    loadBooking: () => Promise<void>;
    acceptUpgrade: () => Promise<void>;
    rejectUpgrade: () => void;
    unlockCar: (carOverride?: Car, successMessage?: string) => Promise<void>;
    // New Navigation/Debug functions
    popupState: 'UPGRADE' | 'UNLOCK' | null;
    openPopup: (type: 'UPGRADE' | 'UNLOCK') => void;
    closePopup: () => void;
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
        hasUpgraded: false
    });

    const [popupState, setPopupState] = useState<'UPGRADE' | 'UNLOCK' | null>(null);

    const openPopup = (type: 'UPGRADE' | 'UNLOCK') => {
        // If user already upgraded, prevent opening the upgrade popup
        if (type === 'UPGRADE' && state.hasUpgraded) {
            return;
        }
        setPopupState(type);
    };

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
                    step: 6, // Move to Upgrade Success Step
                    hasUpgraded: true
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

    const unlockCar = async (carOverride?: Car, successMessage: string = "Car Unlocked!") => {
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
                    step: 5,
                    successMessage
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
            isUnlocked: false,
            hasUpgraded: false
        }));
        setPopupState(null);
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
            popupState,
            openPopup,
            closePopup: () => setPopupState(null),
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
