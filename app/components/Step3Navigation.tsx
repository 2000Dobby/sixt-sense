import { motion } from "framer-motion";
import { MapPin } from "lucide-react";

interface Step3NavigationProps {
    onArrivedClick: () => void;
}

export default function Step3Navigation({ onArrivedClick }: Step3NavigationProps) {
    return (
        <motion.div
            key="step3-content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center text-center"
        >
            <div className="w-full h-64 bg-zinc-900 rounded-3xl mb-8 flex items-center justify-center relative overflow-hidden border border-zinc-800">
                <div className="absolute inset-0 opacity-20" style={{ 
                    backgroundImage: 'radial-gradient(circle at 2px 2px, #ff5f00 1px, transparent 0)',
                    backgroundSize: '20px 20px'
                }}></div>
                <MapPin className="w-16 h-16 text-sixt-orange animate-bounce" />
                <p className="absolute bottom-4 text-zinc-500 text-sm">Navigation Placeholder</p>
            </div>
            <h2 className="text-2xl font-bold mb-2">Head to Parking Row 4</h2>
            <p className="text-zinc-400 mb-8">Your vehicle is located in spot #423.</p>
            
            <button 
                onClick={onArrivedClick}
                className="px-8 py-4 bg-zinc-800 text-white rounded-full font-bold hover:bg-zinc-700 transition-colors border border-zinc-700"
            >
                Simulate: I am at the car
            </button>
        </motion.div>
    );
}
