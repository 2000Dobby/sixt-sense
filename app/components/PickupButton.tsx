import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
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
                onClick={onClick}
                className="w-full bg-sixt-orange text-white font-bold text-lg py-4 rounded-xl shadow-[0_0_20px_rgba(255,95,0,0.3)] hover:shadow-[0_0_30px_rgba(255,95,0,0.5)] transition-shadow flex items-center justify-center gap-2"
            >
                <span>Pick up my car</span>
                <ChevronRight className="w-5 h-5" />
            </motion.button>
        </div>
    );
}
