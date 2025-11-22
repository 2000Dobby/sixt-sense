import { motion } from "framer-motion";
import { Car } from "lucide-react";
import UnlockSlider from "./UnlockSlider";

export default function Step4Unlock() {
    return (
        <motion.div
            key="step4-content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex-1 flex flex-col items-center justify-center w-full"
        >
            <div className="mb-12 text-center">
                <Car className="w-24 h-24 text-zinc-800 mx-auto mb-4" />
                <h2 className="text-3xl font-bold text-white mb-2">BMW 5 Series</h2>
                <p className="text-sixt-orange font-medium">M-XY 1234</p>
            </div>
            
            <UnlockSlider onUnlock={() => void 0} />
        </motion.div>
    );
}
