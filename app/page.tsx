"use client";

import { AnimatePresence } from "framer-motion";
import Header from "./components/Header";
import Step2VehicleSelection from "./components/Step2VehicleSelection";
import Step3Navigation from "./components/Step3Navigation";
import Step5Success from "./components/Step5Success";
import StepUpgradeSuccess from "./components/StepUpgradeSuccess";
import PickupButton from "./components/PickupButton";
import ActionPopup from "./components/ActionPopup";
import { useBooking } from "@/context/BookingContext";

export default function Home() {
  const { step, setStep, bookedCar, availableOffer, assignedCar, acceptUpgrade, rejectUpgrade, openPopup } = useBooking();

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
                <Step2VehicleSelection 
                    currentCar={bookedCar} 
                    offer={availableOffer}
                    onUpgradeClick={handleUpgradeClick} 
                />
            )}

            {step === 6 && (
                <StepUpgradeSuccess />
            )}

            {step === 3 && assignedCar && (
                <Step3Navigation car={assignedCar} />
            )}

            {step === 5 && <Step5Success />}
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

