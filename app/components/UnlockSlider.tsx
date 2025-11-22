import { motion, useMotionValue, useTransform } from "framer-motion";
import { ChevronRight, Unlock } from "lucide-react";
import { useState } from "react";

export default function UnlockSlider({ onUnlock }: { onUnlock: () => void }) {
    const [unlocked, setUnlocked] = useState(false);
    const x = useMotionValue(0);
    const opacity = useTransform(x, [0, 200], [1, 0]);
    const textOpacity = useTransform(x, [0, 100], [1, 0]);
    const bgOpacity = useTransform(x, [0, 220], [0.2, 1]);
    
    const handleDragEnd = () => {
        if (x.get() > 200) {
            setUnlocked(true);
            onUnlock();
        } else {
            // Reset
        }
    };

    if (unlocked) {
        return (
            <motion.div 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="w-full h-16 bg-green-500 rounded-full flex items-center justify-center gap-2 text-black font-bold text-lg"
            >
                <Unlock className="w-6 h-6" />
                Unlocked
            </motion.div>
        );
    }

    return (
        <div className="w-full h-16 bg-zinc-900 rounded-full relative flex items-center p-1 border border-zinc-800 overflow-hidden">
            <motion.div 
                style={{ opacity: bgOpacity }}
                className="absolute inset-0 bg-sixt-orange"
            />
            
            <motion.div 
                style={{ opacity: textOpacity }}
                className="absolute inset-0 flex items-center justify-center text-zinc-500 font-medium pointer-events-none"
            >
                Slide to unlock
            </motion.div>

            <motion.div
                drag="x"
                dragConstraints={{ left: 0, right: 220 }}
                dragElastic={0.1}
                dragSnapToOrigin
                onDragEnd={handleDragEnd}
                style={{ x }}
                className="w-14 h-14 bg-white rounded-full shadow-lg flex items-center justify-center z-10 cursor-grab active:cursor-grabbing"
            >
                <ChevronRight className="text-black w-6 h-6" />
            </motion.div>
        </div>
    );
}
