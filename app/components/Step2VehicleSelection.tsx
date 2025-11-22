import { motion } from "framer-motion";
import { Car as CarIcon, ShieldCheck, ArrowRight } from "lucide-react";
import { Car, UpgradeOffer } from "@/types";

interface Step2VehicleSelectionProps {
    currentCar: Car;
    offer: UpgradeOffer;
    onUpgradeClick: () => void;
}

export default function Step2VehicleSelection({ currentCar, offer, onUpgradeClick }: Step2VehicleSelectionProps) {
    return (
        <motion.div
            key="step2-content"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex flex-col gap-4 mt-4"
        >
            {/* Current Car Card */}
            <div className="bg-zinc-900 rounded-2xl p-6 border border-zinc-800 shadow-lg">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h3 className="text-gray-400 text-sm uppercase tracking-wider">Booked Vehicle</h3>
                        <h2 className="text-2xl font-bold text-white">{currentCar.model}</h2>
                        <p className="text-zinc-500 text-sm">{currentCar.category} • {currentCar.transmission}</p>
                    </div>
                    <CarIcon className="text-sixt-orange w-8 h-8" />
                </div>
                <div className="h-32 bg-zinc-800 rounded-xl flex items-center justify-center mb-2 overflow-hidden relative">
                        {/* Placeholder for Car Image */}
                        <div className="absolute inset-0 bg-gradient-to-br from-zinc-800 to-zinc-900 flex items-center justify-center">
                        <CarIcon className="w-16 h-16 text-zinc-700" />
                        </div>
                        <span className="relative z-10 text-xs text-zinc-500">Vehicle Image</span>
                </div>
            </div>

            {/* Upgrade Card */}
            <div className="bg-gradient-to-br from-zinc-900 to-zinc-950 rounded-2xl p-6 border border-sixt-orange/30 shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-sixt-orange text-black text-xs font-bold px-2 py-1 rounded-bl-lg">
                    UPGRADE
                </div>
                
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h3 className="text-sixt-orange text-sm uppercase tracking-wider font-bold">{offer.title}</h3>
                        <h2 className="text-2xl font-bold text-white">{offer.car?.model || offer.description}</h2>
                        <p className="text-zinc-400 text-sm">{offer.car?.category || "Extra Protection"}</p>
                    </div>
                </div>

                <ul className="space-y-2 mb-6">
                    {offer.benefits.map((benefit, index) => (
                        <li key={index} className="flex items-center gap-2 text-sm text-zinc-300">
                            <ShieldCheck className="w-4 h-4 text-sixt-orange" />
                            <span>{benefit}</span>
                        </li>
                    ))}
                </ul>

                <button 
                    onClick={onUpgradeClick}
                    className="w-full py-3 bg-white text-black font-bold rounded-xl hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
                >
                    Upgrade for ${offer.price}/day <ArrowRight className="w-4 h-4" />
                </button>
            </div>
        </motion.div>
    );
}
