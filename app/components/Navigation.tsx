import { motion } from "framer-motion";
import { Navigation as NavigationIcon } from "lucide-react";
import { Car } from "@/types";
import dynamic from 'next/dynamic';
import { getDistance } from 'geolib';
import { useState, useEffect, useRef, useMemo } from 'react';
import { useLocation } from '@/hooks/use-location';
import { useDeviceOrientation } from '@/hooks/use-device-orientation';
import type { Waypoint } from '@/app/components/Minimap';
import { useBooking } from "@/context/BookingContext";

// Dynamic import for the map to avoid SSR issues with Leaflet
const ParkingNavigator = dynamic(
    () => import('@/app/components/Minimap'),
    {
        ssr: false,
        loading: () => (
            <div className="w-full h-full bg-zinc-900 animate-pulse flex items-center justify-center text-zinc-600">
                Loading Map...
            </div>
        )
    }
);

interface NavigationProps {
    car: Car;
}

export default function Navigation({ car }: NavigationProps) {
    const [isMapLoaded, setIsMapLoaded] = useState(false);
    const [isNearCar, setIsNearCar] = useState(false);
    const hasNotifiedRef = useRef(false);
    const PROXIMITY_THRESHOLD = 10; // meters
    
    const targetPosition = { lat: 48.26324772948778, lng: 11.666841151725487 };
    const { userLocation, errorMsg } = useLocation();
    const { orientation: heading, requestPermission, permissionState } = useDeviceOrientation();
    const { openPopup } = useBooking();

    // Waypoints state
    const [waypointsState, setWaypointsState] = useState<Waypoint[]>([
        {
            id: 'wp-1',
            lat: 48.26241703605156, 
            lng: 11.66895221734899,
            label: 'MI Exit',
            proximityRadius: 15,
        },
        {
            id: 'wp-2',
            lat: 48.26260461716745, 
            lng: 11.667668828526507,
            label: 'Right Turn',
            proximityRadius: 15,
        },
        {
            id: 'wp-3',
            lat: 48.262703429336305, 
            lng: 11.66698454399479,
            label: 'Upgrade Car',
            isHiddenPOI: true,
            poiType: 'car-upgrade',
            proximityRadius: 15,
        },
    ]);

    // Find the next unreached waypoint
    const nextWaypoint = useMemo(() => {
        return waypointsState.find(wp => !wp.isReached);
    }, [waypointsState]);

    // Determine the target (next waypoint or car if all waypoints reached)
    const currentTarget = nextWaypoint
        ? { lat: nextWaypoint.lat, lng: nextWaypoint.lng }
        : targetPosition;

    // Calculate vector and angle to target
    const vectorToTarget = userLocation
        ? {
            lat: currentTarget.lat - userLocation[0],
            lng: currentTarget.lng - userLocation[1],
        }
        : null;
        
    const targetAngle = vectorToTarget
        ? (Math.atan2(vectorToTarget.lng, vectorToTarget.lat) * 180) / Math.PI
        : 0;

    const distance = userLocation
        ? getDistance(
            { latitude: userLocation[0], longitude: userLocation[1] },
            { latitude: currentTarget.lat, longitude: currentTarget.lng }
        )
        : null;

    // Proximity detection effect
    useEffect(() => {
        if (distance !== null && distance <= PROXIMITY_THRESHOLD) {
            if (!hasNotifiedRef.current) {
                hasNotifiedRef.current = true;
                // If it's the final target (car)
                if (!nextWaypoint) {
                     queueMicrotask(() => setIsNearCar(true));
                     openPopup('UNLOCK');
                     window.dispatchEvent(new CustomEvent('carProximityReached', { 
                        detail: { distance, location: userLocation } 
                    }));
                }
            }
        } else if (distance !== null && distance > PROXIMITY_THRESHOLD + 5) {
             hasNotifiedRef.current = false;
        }
    }, [distance, userLocation, nextWaypoint, openPopup]);

    // Handle waypoint reached
    const handleWaypointReached = (reachedWaypoint: Waypoint) => {
        setWaypointsState(prev => prev.map(wp => 
            wp.id === reachedWaypoint.id ? { ...wp, isReached: true } : wp
        ));

        if (reachedWaypoint.isHiddenPOI && reachedWaypoint.poiType === 'car-upgrade') {
            openPopup('UPGRADE');
        }
    };

    // --- UI Logic ---
    // Extract spot number from string like "Spot: #123"
    const spotString = car.spot || "123";
    const spotNumberMatch = spotString.match(/\d+/);
    const spotNumber = spotNumberMatch ? spotNumberMatch[0] : "---";
    const parkingRow = spotNumber.length > 0 ? spotNumber.charAt(0) : "?";

    // Compass & Arrow Rotation Logic
    const [smoothCompassRotation, setSmoothCompassRotation] = useState(0);
    const [smoothArrowRotation, setSmoothArrowRotation] = useState(0);
    
    const compassRotationRef = useRef(0);
    const targetCompassRotationRef = useRef(0);
    
    const arrowRotationRef = useRef(0);
    const targetArrowRotationRef = useRef(0);
    
    const animationFrameRef = useRef<number | null>(null);

    // Update Compass Target
    useEffect(() => {
        if (heading !== null) {
            const target = -heading;
            const current = compassRotationRef.current;
            
            // Calculate shortest path for rotation
            let diff = target - (current % 360);
            // Normalize diff to -180 to 180
            // JS modulo can be negative, so we normalize to 0-360 first to be safe or handle it
            // Actually: (target - (current % 360) + 540) % 360 - 180 is a robust way
            // But simple way:
            while (diff > 180) diff -= 360;
            while (diff < -180) diff += 360;
            
            targetCompassRotationRef.current = current + diff;
        }
    }, [heading]);

    // Update Arrow Target
    useEffect(() => {
        // Lucide Navigation icon points 45 degrees (NE) by default.
        // We need to subtract 45 degrees so that 0 degrees rotation points North (Up).
        const target = targetAngle - 45;
        const current = arrowRotationRef.current;
        
        let diff = target - (current % 360);
        while (diff > 180) diff -= 360;
        while (diff < -180) diff += 360;
        
        targetArrowRotationRef.current = current + diff;
    }, [targetAngle]);

    // Animation Loop
    useEffect(() => {
        const animate = () => {
            // Compass Smoothing
            const currentCompass = compassRotationRef.current;
            const targetCompass = targetCompassRotationRef.current;
            const diffCompass = targetCompass - currentCompass;
            
            if (Math.abs(diffCompass) > 0.01) {
                const nextCompass = currentCompass + diffCompass * 0.15;
                compassRotationRef.current = nextCompass;
                setSmoothCompassRotation(nextCompass);
            }

            // Arrow Smoothing
            const currentArrow = arrowRotationRef.current;
            const targetArrow = targetArrowRotationRef.current;
            const diffArrow = targetArrow - currentArrow;
            
            if (Math.abs(diffArrow) > 0.01) {
                const nextArrow = currentArrow + diffArrow * 0.2;
                arrowRotationRef.current = nextArrow;
                setSmoothArrowRotation(nextArrow);
            }

            animationFrameRef.current = requestAnimationFrame(animate);
        };
        
        animationFrameRef.current = requestAnimationFrame(animate);
        return () => {
            if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
        }
    }, []); 

    return (
        <motion.div
            key="step3-content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col h-full pb-4 gap-4"
        >
            {/* Compass Box */}
            <div className="bg-zinc-900 rounded-2xl py-4 border border-zinc-800 flex flex-row items-center justify-center shrink-0 shadow-lg relative overflow-hidden gap-12">
                 {permissionState === 'prompt' && (
                    <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                        <button 
                            onClick={requestPermission}
                            className="bg-sixt-orange text-white px-4 py-2 rounded-lg font-bold shadow-lg hover:bg-orange-600 transition-colors"
                        >
                            Enable Compass
                        </button>
                    </div>
                 )}
                 
                 <div 
                    className="w-32 h-32 rounded-full border-2 border-zinc-800 flex items-center justify-center relative bg-black/20 shadow-inner"
                    style={{ transform: `rotate(${smoothCompassRotation}deg)` }}
                 >
                     {/* North Marker */}
                     <div className="absolute -top-1 w-2 h-5 bg-sixt-orange rounded-full shadow-[0_0_10px_#ff5f00]"></div>
                     
                     {/* Inner Circle */}
                     <div className="w-24 h-24 rounded-full border border-zinc-700/50 flex flex-col items-center justify-center relative">
                        {/* Arrow pointing to target */}
                        <div 
                            className="absolute inset-0 flex items-center justify-center"
                            style={{ transform: `rotate(${smoothArrowRotation}deg)` }}
                        >
                             <NavigationIcon className="w-12 h-12 text-sixt-orange drop-shadow-[0_0_10px_rgba(255,95,0,0.8)] fill-sixt-orange/20" />
                        </div>
                     </div>
                </div>

                {/* Distance Display */}
                <div className="flex flex-col items-start justify-center z-10">
                    <div className="text-5xl font-bold text-white tracking-tighter">
                        {distance !== null ? Math.round(distance) : '---'}
                        <span className="text-lg text-zinc-500 font-normal ml-1">m</span>
                    </div>
                    <div className="text-xs text-zinc-500 font-bold uppercase tracking-widest mt-1">to target</div>
                </div>
            </div>

            {/* Map Area */}
            <div className="w-full h-80 bg-zinc-900 rounded-2xl overflow-hidden border border-zinc-800 relative shadow-lg shrink-0">
                <ParkingNavigator 
                    carLocation={targetPosition}
                    userLocation={userLocation}
                    onLoad={() => setIsMapLoaded(true)}
                    isNearCar={isNearCar}
                    waypoints={waypointsState}
                    onWaypointReached={handleWaypointReached}
                    onHiddenPOIDiscovered={handleWaypointReached}
                />
                
                {!isMapLoaded && (
                    <div className="absolute inset-0 flex items-center justify-center bg-zinc-900 z-10">
                        <p className="text-zinc-600 text-xs uppercase tracking-widest font-bold animate-pulse">Loading Map...</p>
                    </div>
                )}
            </div>

            {/* Bottom Info */}
            <div className="text-center px-2 shrink-0 py-2">
                <h2 className="text-2xl font-bold mb-1 text-white">
                    {isNearCar ? "You have arrived!" : `Head to Parking Row ${parkingRow}`}
                </h2>
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
