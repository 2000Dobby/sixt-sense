import { motion } from "framer-motion";
import { Check, Car, LucideIcon } from "lucide-react";
import CircularTimer from "./misc/CircularTimer";

interface SuccessScreenProps {
    title: string;
    subtitle?: string;
    duration: number;
    onComplete: () => void;
    icon?: LucideIcon;
}

export default function SuccessScreen({ title, subtitle, duration, onComplete, icon: Icon = Car }: SuccessScreenProps) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="flex-1 flex flex-col items-center justify-center text-center p-6"
        >
            <div className="relative mb-8">
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ 
                        type: "spring",
                        stiffness: 260,
                        damping: 20,
                        delay: 0.2 
                    }}
                    className="w-32 h-32 bg-sixt-orange rounded-full flex items-center justify-center shadow-[0_0_50px_rgba(255,95,0,0.4)]"
                >
                    <Icon className="w-16 h-16 text-white" />
                </motion.div>
                <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.5, duration: 0.3 }}
                    className="absolute -bottom-2 -right-2 bg-green-500 rounded-full p-2 border-4 border-black"
                >
                    <Check className="w-6 h-6 text-white" />
                </motion.div>
            </div>

            <motion.h2 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="text-3xl font-bold mb-4 text-white"
            >
                {title}
            </motion.h2>
            
            {subtitle && (
                <motion.p 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                    className="text-xl text-zinc-400"
                >
                    {subtitle}
                </motion.p>
            )}

            <CircularTimer 
                duration={duration} 
                onComplete={onComplete} 
            />
        </motion.div>
    );
}
