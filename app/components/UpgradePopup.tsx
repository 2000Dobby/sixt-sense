import { motion, AnimatePresence } from "framer-motion";
import { X, Car as CarIcon, ShieldCheck } from "lucide-react";
import { useBooking } from "@/context/BookingContext";
import UnlockSlider from "./UnlockSlider";

export default function UpgradePopup() {
    const { isUpgradePopupOpen, closeUpgradePopup, availableOffer, acceptUpgrade, unlockCar, isLoading } = useBooking();

    const handleSwipeToUpgrade = async () => {
        if (availableOffer?.car) {
            await acceptUpgrade();
            await unlockCar(availableOffer.car, "Successfully upgraded & unlocked car");
            closeUpgradePopup();
        }
    };

    return (
        <AnimatePresence>
            {isUpgradePopupOpen && availableOffer && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={closeUpgradePopup}
                        className="fixed inset-0 bg-black/80 z-50 backdrop-blur-sm"
                    />
                    <motion.div
                        initial={{ y: "100%" }}
                        animate={{ y: 0 }}
                        exit={{ y: "100%" }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className="fixed bottom-0 left-0 right-0 bg-[#1a1a1a] rounded-t-3xl p-6 z-50 border-t border-white/10 max-h-[85vh] overflow-y-auto"
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <div className="text-sixt-orange font-bold text-sm uppercase tracking-wider mb-1">
                                    Nearby Opportunity
                                </div>
                                <h2 className="text-2xl font-bold text-white">
                                    Upgrade to {availableOffer.car?.model}
                                </h2>
                                <p className="text-zinc-400 text-sm">
                                    {availableOffer.car?.category}
                                </p>
                            </div>
                            <button 
                                onClick={closeUpgradePopup}
                                className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors"
                            >
                                <X className="text-white w-6 h-6" />
                            </button>
                        </div>

                        <div className="mb-6 text-gray-300 text-sm">
                            You are walking past a {availableOffer.car?.category}. 
                            Why not take it for just +{availableOffer.price}€/day?
                        </div>

                        {/* Car Image Placeholder */}
                        <div className="h-32 bg-zinc-800/50 rounded-xl flex items-center justify-center mb-6 relative overflow-hidden border border-white/5">
                            <div className="absolute inset-0 bg-gradient-to-br from-zinc-800/50 to-transparent flex items-center justify-center">
                                <CarIcon className="w-20 h-20 text-zinc-600" />
                            </div>
                        </div>

                        {/* Benefits List */}
                        <ul className="space-y-2 mb-8">
                            {availableOffer.benefits.map((benefit, index) => (
                                <li key={index} className="flex items-center gap-2 text-sm text-zinc-300">
                                    <ShieldCheck className="w-4 h-4 text-sixt-orange shrink-0" />
                                    <span>{benefit}</span>
                                </li>
                            ))}
                        </ul>

                        <div className="mb-4">
                            <UnlockSlider 
                                onUnlock={handleSwipeToUpgrade} 
                                label="Slide to Upgrade & Unlock" 
                                successLabel="Upgraded & Unlocked"
                                isLoading={isLoading} 
                            />
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
