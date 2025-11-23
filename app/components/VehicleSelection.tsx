import { motion } from "framer-motion";
import { Car as CarIcon, ShieldCheck, ArrowRight, Shield, Sparkles } from "lucide-react";
import Image from "next/image";
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

import { useState } from "react";

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

    const [imgError, setImgError] = useState(false);
    const [upgradeImgError, setUpgradeImgError] = useState(false);

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
                <div className="h-28 bg-zinc-800 rounded-xl flex items-center justify-center mb-2 overflow-hidden relative">
                    <div className="absolute inset-0 bg-linear-to-br from-zinc-800 to-zinc-900" />
                    {!imgError && currentCar.image ? (
                        <Image 
                            src={currentCar.image} 
                            alt={currentCar.model}
                            fill
                            className="object-contain p-2 relative z-10"
                            onError={() => setImgError(true)}
                        />
                    ) : (
                        <CarIcon className="w-16 h-16 text-zinc-600" />
                    )}
                </div>
            </div>

            {/* Upgrade Card */}
            <div className="flex-1 bg-gradient-to-br from-zinc-900 to-zinc-950 rounded-2xl p-5 border border-sixt-orange/30 shadow-lg relative overflow-y-auto overflow-x-hidden flex flex-col min-h-0">
                <div className="absolute top-0 right-0 bg-sixt-orange text-black text-[10px] font-bold px-3 py-1 rounded-bl-xl z-20 tracking-widest">
                    UPGRADE
                </div>
                
                <div className="flex justify-between items-start mb-2 shrink-0">
                    <div className="max-w-[70%]">
                        <h3 className="text-sixt-orange text-sm uppercase tracking-wider font-bold">{offer.title}</h3>
                        <h2 className="text-2xl font-bold text-white leading-tight my-1">
                            {hasCar ? offer.car?.model : offer.subtitle}
                        </h2>
                        {/* Explanation text from recommendation engine */}
                        {offer.description && (
                            <div className="flex gap-2 mt-2">
                                <Sparkles className="w-4 h-4 text-yellow-400 shrink-0 mt-0.5" />
                                <p className="text-xs text-zinc-300 leading-relaxed italic">
                                    "{offer.description}"
                                </p>
                            </div>
                        )}
                    </div>
                    
                    {hasCar && (
                        <div className="flex flex-col items-end pt-1">
                            <CarIcon className="text-sixt-orange w-8 h-8 mb-2" />
                            <div className="text-sm font-bold text-white">{offer.car?.spot || "Spot: #--"}</div>
                            <div className="text-xs text-zinc-500">{upgradeDistance} away</div>
                        </div>
                    )}
                </div>

                {/* Dynamic Content Area */}
                {hasCar && (
                    <div className="h-44 shrink-0 flex items-center justify-center my-2 relative overflow-hidden rounded-xl">
                        <div className="absolute inset-0 bg-linear-to-br from-zinc-800/50 to-transparent" />
                        {!upgradeImgError && offer.car?.image ? (
                            <Image 
                                src={offer.car.image} 
                                alt={offer.car.model}
                                fill
                                className="object-contain p-2 relative z-10"
                                onError={() => setUpgradeImgError(true)}
                            />
                        ) : (
                             <CarIcon className="w-16 h-16 text-zinc-600" />
                        )}
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
                        label={`Slide to ${hasCar ? 'upgrade' : 'add'} for +${offer.price.toFixed(2)}€/day`}
                        successLabel={hasCar ? "Upgraded" : "Added"}
                        isLoading={isLoading}
                    />
                </div>
            </div>
        </motion.div>
    );
}
