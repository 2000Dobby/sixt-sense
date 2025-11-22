"use client";
import { useState, useEffect } from "react";
import { useBooking } from "@/context/BookingContext";
import { MapPin, RotateCcw, Package, Shield, Car } from "lucide-react";
import { mockOffers } from "@/services/mockApi";
import clsx from "clsx";

export default function DebugOverlay() {
    const [isVisible, setIsVisible] = useState(false);
    const { step, setStep, openUpgradePopup, resetFlow, setDebugOffer } = useBooking();

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key.toLowerCase() === 'h') {
                setIsVisible(prev => !prev);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    if (!isVisible) return null;

    return (
        <div className="fixed bottom-4 right-4 z-[100]">
            <div className="w-64 bg-gray-900/95 backdrop-blur border border-gray-700 rounded-xl p-4 shadow-2xl text-sm">
                    <div className="font-bold text-gray-400 mb-3 uppercase text-xs tracking-wider">Debug Controls</div>
                    
                    <div className="space-y-2">
                        <button 
                            onClick={resetFlow}
                            className="w-full flex items-center gap-2 p-2 bg-red-500/20 text-red-400 rounded hover:bg-red-500/30 transition-colors"
                        >
                            <RotateCcw className="w-4 h-4" /> Reset App
                        </button>

                        {step === 2 && (
                            <>
                                <div className="h-px bg-gray-700 my-2" />
                                <div className="font-bold text-gray-400 mb-2 uppercase text-xs tracking-wider">Set Offer Type</div>
                                <div className="grid grid-cols-2 gap-2">
                                    <button onClick={() => setDebugOffer(mockOffers.car)} className="p-2 bg-zinc-800 rounded hover:bg-zinc-700 flex flex-col items-center gap-1 text-[10px] text-zinc-400">
                                        <Car className="w-4 h-4" /> Car
                                    </button>
                                    <button onClick={() => setDebugOffer(mockOffers.protection)} className="p-2 bg-zinc-800 rounded hover:bg-zinc-700 flex flex-col items-center gap-1 text-[10px] text-zinc-400">
                                        <Shield className="w-4 h-4" /> Prot
                                    </button>
                                </div>
                            </>
                        )}

                        {step === 3 && (
                            <>
                                <div className="h-px bg-gray-700 my-2" />
                                <div className="font-bold text-gray-400 mb-2 uppercase text-xs tracking-wider">Simulate GPS</div>
                                
                                <button 
                                    onClick={() => setStep(4)}
                                    className="w-full flex items-center gap-2 p-2 bg-green-500/20 text-green-400 rounded hover:bg-green-500/30 transition-colors"
                                >
                                    <MapPin className="w-4 h-4" /> Near Booked Car
                                </button>

                                <button 
                                    onClick={openUpgradePopup}
                                    className="w-full flex items-center gap-2 p-2 bg-sixt-orange/20 text-sixt-orange rounded hover:bg-sixt-orange/30 transition-colors"
                                >
                                    <MapPin className="w-4 h-4" /> Near Upgrade Car
                                </button>
                            </>
                        )}
                    </div>
                    
                    <div className="mt-3 text-xs text-gray-500 font-mono">
                        Current Step: {step}
                    </div>
            </div>
        </div>
    );
}
