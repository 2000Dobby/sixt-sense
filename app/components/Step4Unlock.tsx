import { motion } from "framer-motion";
import { Car } from "lucide-react";
import UnlockSlider from "./UnlockSlider";

export default function Step4Unlock() {
    return (
        <motion.div
            key="step4-content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex-1 flex flex-col items-center justify-center w-full relative overflow-hidden"
        >
            {/* Circular Fade Background */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                <div className="w-[60vw] h-[60vw] max-w-[500px] max-h-[500px] bg-sixt-orange opacity-30 rounded-full blur-[80px]" />
            </div>

            <div className="mb-12 text-center relative z-10">
                <Car className="w-24 h-24 text-zinc-800 mx-auto mb-4" />
                <h2 className="text-3xl font-bold text-white mb-2">BMW 5 Series</h2>
                <p className="text-sixt-orange font-medium">M-XY 1234</p>
            </div>
            
            <div className="w-full relative z-10">
                <UnlockSlider onUnlock={() => void 0} />
            </div>
        </motion.div>
    );
}
