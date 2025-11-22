import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface CircularTimerProps {
    duration: number; // in ms
    onComplete: () => void;
    color?: string;
}

export default function CircularTimer({ duration, onComplete, color = "text-sixt-orange" }: CircularTimerProps) {
    const [progress, setProgress] = useState(0);
    const INTERVAL = 30;

    useEffect(() => {
        const timer = setInterval(() => {
            setProgress(prev => {
                if (prev >= 100) {
                    clearInterval(timer);
                    return 100;
                }
                return prev + (100 / (duration / INTERVAL));
            });
        }, INTERVAL);

        const completeTimer = setTimeout(() => {
            onComplete();
        }, duration);

        return () => {
            clearInterval(timer);
            clearTimeout(completeTimer);
        };
    }, [duration, onComplete]);

    const radius = 30;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (progress / 100) * circumference;

    return (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="relative w-16 h-16 flex items-center justify-center mt-8"
        >
            <svg className="transform -rotate-90 w-16 h-16">
                <circle
                    cx="32"
                    cy="32"
                    r={radius}
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="transparent"
                    className="text-zinc-800"
                />
                <circle
                    cx="32"
                    cy="32"
                    r={radius}
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="transparent"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    className={`${color} transition-all duration-75 ease-linear`}
                />
            </svg>
            <div className="absolute text-xs font-bold text-zinc-500">
                {Math.ceil((duration - (progress / 100 * duration)) / 1000)}s
            </div>
        </motion.div>
    );
}
