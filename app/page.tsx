"use client";

import { AnimatePresence } from "framer-motion";
import { Shield, Car } from "lucide-react";
import Header from "./components/misc/Header";
import VehicleSelection from "./components/VehicleSelection";
import Navigation from "./components/Navigation";
import SuccessScreen from "./components/SuccessScreen";
import PickupButton from "./components/misc/PickupButton";
import ActionPopup from "./components/misc/ActionPopup";
import { useBooking } from "@/context/BookingContext";

export default function Home() {
  const { step, setStep, bookedCar, availableOffer, assignedCar, acceptUpgrade, rejectUpgrade, openPopup, successMessage, resetFlow } = useBooking();

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

      {/* Content Area */}
      <div className="flex-1 w-full max-w-md flex flex-col relative px-4 pb-4">
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
                    title={successMessage || "You have successfully upgraded to a better car"}
                    duration={3000}
                    onComplete={() => setStep(3)}
                    icon={availableOffer?.type === 'PROTECTION' ? Shield : Car}
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

