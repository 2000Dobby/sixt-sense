import { motion } from "framer-motion";
import { Car as CarIcon, ShieldCheck, ArrowRight, Shield } from "lucide-react";
import { Car, UpgradeOffer } from "@/types";
import UnlockSlider from "./misc/UnlockSlider";
import { useBooking } from "@/context/BookingContext";

interface VehicleSelectionProps {
    currentCar: Car;
    offer: UpgradeOffer;
    onUpgradeClick: () => void;
    distance?: string;
    upgradeDistance?: string;
}

export default function VehicleSelection({ 
    currentCar, 
    offer, 
    onUpgradeClick, 
    distance = "350m",
    upgradeDistance = "150m"
}: VehicleSelectionProps) {
    const { isLoading } = useBooking();
    const isProtectionOnly = offer.type === 'PROTECTION';
    const hasCar = offer.type === 'CAR_UPGRADE';

    return (
        <motion.div
            key="step2-content"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex-1 flex flex-col gap-4 mt-4 pb-24 h-full"
        >
            {/* Current Car Card */}
            <div className="bg-zinc-900 rounded-2xl p-5 border border-zinc-800 shadow-lg shrink-0">
                <div className="flex justify-between items-start mb-2">
                    <div>
                        <h3 className="text-gray-400 text-sm uppercase tracking-wider">Booked Vehicle</h3>
                        <h2 className="text-2xl font-bold text-white">{currentCar.model}</h2>
                        <p className="text-zinc-500 text-sm">{currentCar.category}</p>
                    </div>
                    <div className="flex flex-col items-end">
                        <CarIcon className="text-sixt-orange w-8 h-8 mb-2" />
                        <div className="text-sm font-bold text-white">{currentCar.spot}</div>
                        <div className="text-xs text-zinc-500">{distance} away</div>
                    </div>
                </div>
                <div className="h-24 bg-zinc-800 rounded-xl flex items-center justify-center mb-2 overflow-hidden relative">
                        {/* Placeholder for Car Image */}
                        <div className="absolute inset-0 bg-gradient-to-br from-zinc-800 to-zinc-900 flex items-center justify-center">
                        <CarIcon className="w-16 h-16 text-zinc-700" />
                        </div>
                        <span className="relative z-10 text-xs text-zinc-500">Vehicle Image</span>
                </div>
            </div>

            {/* Upgrade Card */}
            <div className="flex-1 bg-gradient-to-br from-zinc-900 to-zinc-950 rounded-2xl p-5 border border-sixt-orange/30 shadow-lg relative overflow-hidden flex flex-col min-h-0">
                <div className="absolute top-0 right-0 bg-sixt-orange text-black text-[10px] font-bold px-3 py-1 rounded-bl-xl z-20 tracking-widest">
                    UPGRADE
                </div>
                
                <div className="flex justify-between items-start mb-2 shrink-0">
                    <div>
                        <h3 className="text-sixt-orange text-sm uppercase tracking-wider font-bold">{offer.title}</h3>
                        <h2 className="text-2xl font-bold text-white">
                            {hasCar ? offer.car?.model : offer.description}
                        </h2>
                        <p className="text-zinc-400 text-sm">
                            {hasCar ? offer.car?.category : "Full Coverage"}
                        </p>
                    </div>
                    
                    {hasCar && (
                        <div className="flex flex-col items-end pt-4">
                            <CarIcon className="text-sixt-orange w-8 h-8 mb-2" />
                            <div className="text-sm font-bold text-white">{offer.car?.spot || "Spot: #--"}</div>
                            <div className="text-xs text-zinc-500">{upgradeDistance} away</div>
                        </div>
                    )}
                </div>

                {/* Dynamic Content Area */}
                {hasCar && (
                    <div className="flex-1 min-h-0 flex items-center justify-center my-2 relative">
                        <div className="absolute inset-0 bg-gradient-to-br from-zinc-800/50 to-transparent rounded-xl flex items-center justify-center">
                            <CarIcon className="w-24 h-24 text-zinc-600" />
                        </div>
                    </div>
                )}

                <ul className="space-y-1 mb-4 mt-2 shrink-0">
                    {offer.benefits.map((benefit, index) => (
                        <li key={index} className="flex items-center gap-2 text-sm text-zinc-300">
                            <ShieldCheck className="w-4 h-4 text-sixt-orange" />
                            <span>{benefit}</span>
                        </li>
                    ))}
                </ul>

                <div className="mt-auto shrink-0">
                    <UnlockSlider 
                        onUnlock={onUpgradeClick} 
                        label={`Slide to upgrade for +${offer.price}€/day`}
                        successLabel="Upgraded"
                        isLoading={isLoading}
                    />
                </div>
            </div>
        </motion.div>
    );
}
