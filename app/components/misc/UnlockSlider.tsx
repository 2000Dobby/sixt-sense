import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { ChevronRight, Unlock } from "lucide-react";
import { useState, useRef, useEffect } from "react";

interface UnlockSliderProps {
    onUnlock: () => void;
    label?: string;
    isLoading?: boolean;
    successLabel?: string;
}

export default function UnlockSlider({ 
    onUnlock, 
    label = "Slide to unlock", 
    isLoading = false,
    successLabel = "Unlocked"
}: UnlockSliderProps) {
    const [isCompleted, setIsCompleted] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const [sliderWidth, setSliderWidth] = useState(0);
    const x = useMotionValue(0);
    
    const textOpacity = useTransform(x, [0, sliderWidth / 2], [1, 0]);
    const bgOpacity = useTransform(x, [0, sliderWidth], [0.2, 1]);
    
    useEffect(() => {
        const updateWidth = () => {
            if (containerRef.current) {
                // Container width - padding (4px * 2) - handle width (56px)
                setSliderWidth(containerRef.current.offsetWidth - 8 - 56);
            }
        };

        updateWidth();
        window.addEventListener('resize', updateWidth);
        return () => window.removeEventListener('resize', updateWidth);
    }, []);
    
    const handleDragEnd = () => {
        if (x.get() > sliderWidth * 0.8) {
            animate(x, sliderWidth, {
                type: "spring",
                stiffness: 400,
                damping: 40,
                onComplete: () => {
                    setIsCompleted(true);
                    // Add a small delay before calling onUnlock to let the user see the success state
                    setTimeout(() => {
                        onUnlock();
                    }, 200);
                }
            });
        } else {
            animate(x, 0, {
                type: "spring",
                stiffness: 400,
                damping: 40
            });
        }
    };

    if (isCompleted) {
        return (
            <motion.div 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="w-full h-16 bg-green-500 rounded-full flex items-center justify-center gap-2 text-black font-bold text-lg"
            >
                <Unlock className="w-6 h-6" />
                {successLabel}
            </motion.div>
        );
    }

    return (
        <div 
            ref={containerRef}
            className="w-full h-16 bg-zinc-900 rounded-full relative flex items-center p-1 border border-zinc-800 overflow-hidden"
        >
            <motion.div 
                style={{ opacity: bgOpacity }}
                className="absolute inset-0 bg-sixt-orange"
            />
            
            <motion.div 
                style={{ opacity: textOpacity }}
                className="absolute inset-0 flex items-center justify-center text-zinc-500 font-medium pointer-events-none"
            >
                {label}
            </motion.div>

            <motion.div
                drag={!isCompleted && !isLoading ? "x" : false}
                dragConstraints={{ left: 0, right: sliderWidth }}
                dragElastic={0.05}
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
