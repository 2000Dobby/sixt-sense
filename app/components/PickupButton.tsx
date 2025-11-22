import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import clsx from "clsx";

interface PickupButtonProps {
    step: number;
    onClick: () => void;
}

export default function PickupButton({ step, onClick }: PickupButtonProps) {
    if (step !== 1 && step !== 2) return null;

    return (
        <div className={clsx(
            "fixed w-full max-w-md px-4 transition-all duration-500 ease-in-out z-20",
            step === 1 ? "top-1/2 -translate-y-1/2" : "bottom-8"
        )}>
            <motion.button
                layoutId="pickup-button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onClick}
                className="group w-full bg-gradient-to-r from-sixt-orange to-[#ff8533] text-white font-bold text-lg py-4 rounded-2xl shadow-[0_10px_30px_-10px_rgba(255,95,0,0.5)] border border-white/10 flex items-center justify-center gap-2 relative overflow-hidden"
            >
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out blur-xl" />
                <span className="relative z-10">Pick up my car</span>
                <ArrowRight className="w-6 h-6 relative z-10 group-hover:translate-x-1 transition-transform" />
            </motion.button>
        </div>
    );
}
