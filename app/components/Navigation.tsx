import { motion } from "framer-motion";
import { Navigation as NavigationIcon } from "lucide-react";
import { Car } from "@/types";

interface NavigationProps {
    car: Car;
}

export default function Navigation({ car }: NavigationProps) {
    // Extract spot number from string like "Spot: #123"
    const spotString = car.spot || "123";
    const spotNumber = spotString.replace(/[^0-9]/g, '');
    const parkingRow = spotNumber.charAt(0);

    return (
        <motion.div
            key="step3-content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col h-full pb-4 gap-4"
        >
            {/* Compass Box */}
            <div className="bg-zinc-900 rounded-2xl py-6 border border-zinc-800 flex items-center justify-center shrink-0 shadow-lg">
                 <div className="w-40 h-40 rounded-full border-2 border-zinc-800 flex items-center justify-center relative bg-black/20 shadow-inner">
                     {/* North Marker */}
                     <div className="absolute -top-1 w-2 h-5 bg-sixt-orange rounded-full shadow-[0_0_10px_#ff5f00]"></div>
                     
                     {/* Inner Circle */}
                     <div className="w-32 h-32 rounded-full border border-zinc-700/50 flex flex-col items-center justify-center relative">
                        <NavigationIcon className="w-6 h-6 text-sixt-orange mb-1" />
                        <div className="text-3xl font-bold text-white tracking-tighter">150<span className="text-sm text-zinc-500 font-normal ml-1">m</span></div>
                     </div>
                </div>
            </div>

            {/* Map Area */}
            <div className="flex-1 bg-zinc-900 rounded-2xl overflow-hidden border border-zinc-800 relative min-h-0 shadow-lg">
                <div className="absolute inset-0 opacity-20" style={{ 
                    backgroundImage: 'radial-gradient(circle at 2px 2px, #ff5f00 1px, transparent 0)',
                    backgroundSize: '40px 40px'
                }}></div>
                {/* Map Grid Lines */}
                <div className="absolute inset-0" style={{
                    backgroundImage: 'linear-gradient(to right, #333 1px, transparent 1px), linear-gradient(to bottom, #333 1px, transparent 1px)',
                    backgroundSize: '60px 60px',
                    opacity: 0.3
                }}></div>
                
                <div className="absolute inset-0 flex items-center justify-center">
                    <p className="text-zinc-600 text-xs uppercase tracking-widest font-bold">Map View</p>
                </div>
            </div>

            {/* Bottom Info */}
            <div className="text-center px-2 shrink-0 py-2">
                <h2 className="text-2xl font-bold mb-1 text-white">Head to Parking Row {parkingRow}</h2>
                <p className="text-zinc-400 text-base mb-1">
                    Your vehicle is located in spot <span className="text-sixt-orange font-bold">#{spotNumber}</span>.
                </p>
                <div className="inline-block bg-zinc-800 px-3 py-1 rounded text-sm font-mono text-zinc-300 border border-zinc-700">
                    {car.licensePlate}
                </div>
            </div>
        </motion.div>
    );
}
