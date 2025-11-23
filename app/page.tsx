"use client";

import { AnimatePresence } from "framer-motion";
import Header from "./components/misc/Header";
import VehicleSelection from "./components/VehicleSelection";
import Navigation from "./components/Navigation";
import SuccessScreen from "./components/SuccessScreen";
import PickupButton from "./components/misc/PickupButton";
import ActionPopup from "./components/misc/ActionPopup";
import { useBooking } from "@/context/BookingContext";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { PERSONAS } from "@/lib/personas";

// Use all defined personas
const PERSONA_OPTIONS = PERSONAS.map(p => ({ id: p.id, label: p.label }));

// Component that uses useSearchParams must be suspended in Next.js if parent is not suspended
function PersonaToggles({ onPersonaChange }: { onPersonaChange: (id: string) => void }) {
    const searchParams = useSearchParams();
    const currentPersonaId = searchParams.get('personaId');

    return (
        <div className="absolute top-20 left-0 right-0 z-20 flex gap-2 justify-center px-4 overflow-x-auto pb-2">
            {PERSONA_OPTIONS.map(p => (
                <button
                    key={p.id}
                    onClick={() => onPersonaChange(p.id)}
                    className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${
                        currentPersonaId === p.id
                        ? 'bg-sixt-orange text-white' 
                        : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                    }`}
                >
                    {p.label}
                </button>
            ))}
        </div>
    );
}

export default function Home() {
  const { step, setStep, bookedCar, availableOffer, assignedCar, acceptUpgrade, rejectUpgrade, openPopup, successMessage, resetFlow, loadBooking } = useBooking();
  // We don't strictly need local state for persona if we rely on URL, but let's keep it simple
  
  const handlePersonaChange = (id: string) => {
      if (step <= 2) {
          const url = new URL(window.location.href);
          url.searchParams.set('personaId', id);
          window.location.href = url.toString();
      }
  };

  const handlePickupClick = () => {
    if (step === 1) setStep(2);
    else if (step === 2) rejectUpgrade();
    else if (step === 3) openPopup('UNLOCK');
  };

  const handleUpgradeClick = async () => {
    await acceptUpgrade();
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-between bg-black text-white overflow-hidden relative font-sans">
      <Header step={step} />

      {/* MVP Persona Toggles - Only show on step 1 */}
      {step === 1 && (
        <Suspense fallback={<div className="h-8" />}>
            <PersonaToggles onPersonaChange={handlePersonaChange} />
        </Suspense>
      )}

      {/* Content Area */}
      <div className="flex-1 w-full max-w-md flex flex-col relative px-4 pb-4 pt-8"> 
        <AnimatePresence mode="wait">
            {step === 2 && bookedCar && availableOffer && (
                <VehicleSelection 
                    currentCar={bookedCar} 
                    offer={availableOffer}
                    onUpgradeClick={handleUpgradeClick} 
                />
            )}

            {step === 6 && (
                <SuccessScreen 
                    key="upgrade-success"
                    title="You have successfully upgraded to a better car"
                    duration={3000}
                    onComplete={() => setStep(3)}
                />
            )}

            {step === 3 && assignedCar && (
                <Navigation car={assignedCar} />
            )}

            {step === 5 && (
                <SuccessScreen 
                    key="unlock-success"
                    title={successMessage || "Car Unlocked!"}
                    subtitle="Drive safe, see you soon."
                    duration={10000}
                    onComplete={resetFlow}
                />
            )}
        </AnimatePresence>
      </div>

      {/* Bottom Action Area (The Moving Button) */}
      <AnimatePresence>
        <PickupButton step={step} onClick={handlePickupClick} />
      </AnimatePresence>

      <ActionPopup />
    </main>
  );
}
