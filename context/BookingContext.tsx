"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { BookingState, Car, UpgradeOffer } from '@/types';
import { api } from '@/services/api';

interface BookingContextType extends BookingState {
    setStep: (step: number) => void;
    loadBooking: (personaId?: string) => Promise<void>;
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
        bookingId: null,
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

    const loadBooking = async (personaIdFromParam?: string) => {
        setState(prev => ({ ...prev, isLoading: true }));
        try {
            const bookingId = state.bookingId || "987654321";
            let data;
            
            // Get personaId from URL if not explicitly passed (for initial load)
            let currentPersonaId = personaIdFromParam;
            if (!currentPersonaId && typeof window !== 'undefined') {
                const params = new URLSearchParams(window.location.search);
                currentPersonaId = params.get('personaId') || undefined;
            }

            data = await api.fetchBookingDetails(bookingId, currentPersonaId);
            
            setState(prev => ({
                ...prev,
                bookingId: data.bookingId,
                bookedCar: data.bookedCar,
                assignedCar: data.bookedCar, // Initially assigned the booked car
                availableOffer: data.offer,
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
            const success = await api.postUpgrade(state.bookingId || "987654321", state.availableOffer.id);

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
            const success = await api.postUnlock(carToUnlock.id);

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
        // Check for personaId in URL query params
        const params = new URLSearchParams(window.location.search);
        const personaId = params.get("personaId") || undefined;
        
        // IMPORTANT: Always load, even if no persona param (will default or use existing bookingId)
        loadBooking(personaId);
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
