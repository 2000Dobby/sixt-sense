import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { useBooking } from "@/context/BookingContext";
import UnlockSlider from "./UnlockSlider";

export default function UpgradePopup() {
    const { isUpgradePopupOpen, closeUpgradePopup, availableOffer, acceptUpgrade, unlockCar } = useBooking();

    const handleSwipeToUpgrade = async () => {
        if (availableOffer?.car) {
            await acceptUpgrade();
            await unlockCar(availableOffer.car);
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
                        className="fixed bottom-0 left-0 right-0 bg-[#1a1a1a] rounded-t-3xl p-6 z-50 border-t border-white/10"
                    >
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <div className="text-sixt-orange font-bold text-sm uppercase tracking-wider mb-1">
                                    Nearby Opportunity
                                </div>
                                <h2 className="text-2xl font-bold text-white">
                                    Upgrade to {availableOffer.car?.model}
                                </h2>
                            </div>
                            <button 
                                onClick={closeUpgradePopup}
                                className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors"
                            >
                                <X className="text-white w-6 h-6" />
                            </button>
                        </div>

                        <div className="mb-8 text-gray-300">
                            You are walking past a {availableOffer.car?.category}. 
                            Why not take it for just +{availableOffer.price}€/day?
                        </div>

                        <div className="mb-4">
                            <UnlockSlider onUnlock={handleSwipeToUpgrade} label="Slide to Upgrade & Unlock" />
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
