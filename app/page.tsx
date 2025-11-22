"use client";

import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import Header from "./components/Header";
import Step2VehicleSelection from "./components/Step2VehicleSelection";
import Step3Navigation from "./components/Step3Navigation";
import Step4Unlock from "./components/Step4Unlock";
import PickupButton from "./components/PickupButton";

export default function Home() {
  const [step, setStep] = useState(1);

  const handlePickupClick = () => {
    if (step === 1) setStep(2);
    else if (step === 2) setStep(3);
  };

  const handleUpgradeClick = () => {
    setStep(3);
  };

  const handleArrivedClick = () => {
    setStep(4);
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-between bg-black text-white overflow-hidden relative font-sans">
      <Header step={step} />

      {/* Content Area */}
      <div className="flex-1 w-full max-w-md flex flex-col relative px-4 pb-4">
        <AnimatePresence mode="wait">
            {step === 2 && (
                <Step2VehicleSelection onUpgradeClick={handleUpgradeClick} />
            )}

            {step === 3 && (
                <Step3Navigation onArrivedClick={handleArrivedClick} />
            )}

            {step === 4 && (
                <Step4Unlock />
            )}
        </AnimatePresence>
      </div>

      {/* Bottom Action Area (The Moving Button) */}
      <AnimatePresence>
        <PickupButton step={step} onClick={handlePickupClick} />
      </AnimatePresence>
    </main>
  );
}

