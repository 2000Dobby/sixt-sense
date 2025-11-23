import { motion, AnimatePresence } from "framer-motion";
import { X, Car as CarIcon, ShieldCheck } from "lucide-react";
import { useBooking } from "@/context/BookingContext";
import UnlockSlider from "./UnlockSlider";

export default function ActionPopup() {
    const { popupState, closePopup, availableOffer, assignedCar, acceptUpgrade, unlockCar, isLoading } = useBooking();

    const isUpgrade = popupState === 'UPGRADE';
    const isUnlock = popupState === 'UNLOCK';
    
    // Determine content based on mode
    const car = isUpgrade ? availableOffer?.car : assignedCar;
    
    // If no car data available for the active mode, don't render
    if (!popupState || !car) return null;

    const handleAction = async () => {
        if (isUpgrade && availableOffer?.car) {
            await acceptUpgrade();
            await unlockCar(availableOffer.car, "Successfully upgraded & unlocked car");
            closePopup();
        } else if (isUnlock) {
            await unlockCar(car, "Car Unlocked!");
            closePopup();
        }
    };

    return (
        <AnimatePresence>
            {popupState && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={closePopup}
                        className="fixed inset-0 bg-black/80 z-[1000] backdrop-blur-sm"
                    />
                    <motion.div
                        initial={{ y: "100%" }}
                        animate={{ y: 0 }}
                        exit={{ y: "100%" }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className="fixed bottom-0 left-0 right-0 bg-[#1a1a1a] rounded-t-3xl p-6 z-[1001] border-t border-white/10 max-h-[85vh] overflow-y-auto"
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <div className={`font-bold text-sm uppercase tracking-wider mb-1 ${isUpgrade ? 'text-sixt-orange' : 'text-green-500'}`}>
                                    {isUpgrade ? "Nearby Opportunity" : "You Arrived"}
                                </div>
                                <h2 className="text-2xl font-bold text-white">
                                    {isUpgrade ? `Upgrade to ${car.model}` : car.model}
                                </h2>
                                <p className="text-zinc-400 text-sm">
                                    {car.category}
                                </p>
                            </div>
                            <button 
                                onClick={closePopup}
                                className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors"
                            >
                                <X className="text-white w-6 h-6" />
                            </button>
                        </div>

                        {isUpgrade && (
                            <div className="mb-6 text-gray-300 text-sm">
                                You are walking past a {car.category}. 
                                Why not take it for just +{availableOffer?.price}€/day?
                            </div>
                        )}

                        {/* Car Image Placeholder */}
                        <div className="h-32 bg-zinc-800/50 rounded-xl flex items-center justify-center mb-6 relative overflow-hidden border border-white/5">
                            <div className="absolute inset-0 bg-gradient-to-br from-zinc-800/50 to-transparent flex items-center justify-center">
                                <CarIcon className="w-20 h-20 text-zinc-600" />
                            </div>
                        </div>

                        {/* Benefits List (Upgrade Only) */}
                        {isUpgrade && availableOffer && (
                            <ul className="space-y-2 mb-8">
                                {availableOffer.benefits.map((benefit, index) => (
                                    <li key={index} className="flex items-center gap-2 text-sm text-zinc-300">
                                        <ShieldCheck className="w-4 h-4 text-sixt-orange shrink-0" />
                                        <span>{benefit}</span>
                                    </li>
                                ))}
                            </ul>
                        )}

                        {/* Car Details: Spot & License */}
                        <div className="flex justify-between items-end mb-6 px-1">
                            <div>
                                <div className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Parking Spot</div>
                                <div className="text-2xl font-bold text-white">
                                    #{car.spot?.replace(/[^0-9]/g, '') || "--"}
                                </div>
                            </div>
                            <div>
                                <div className="text-xs text-zinc-500 uppercase tracking-wider mb-1 text-right">License Plate</div>
                                <div className="bg-zinc-800 px-3 py-1.5 rounded-lg text-sm font-mono text-zinc-300 border border-zinc-700">
                                    {car.licensePlate || "M JP 2371"}
                                </div>
                            </div>
                        </div>

                        <div className="mb-4">
                            <UnlockSlider 
                                onUnlock={handleAction} 
                                label={isUpgrade ? "Slide to Upgrade & Unlock" : "Slide to Unlock"}
                                successLabel={isUpgrade ? "Upgraded & Unlocked" : "Unlocked"}
                                isLoading={isLoading} 
                            />
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
