import { motion } from "framer-motion";
import { Navigation as NavigationIcon } from "lucide-react";
import { Car } from "@/types";
import dynamic from 'next/dynamic';
import { getDistance } from 'geolib';
import { useState, useEffect, useRef, useMemo } from 'react';
import { useLocation } from '@/app/navigation/_hooks/use-location';
import { useDeviceOrientation } from '@/app/navigation/_hooks/use-device-orientation';
import type { Waypoint } from '@/app/navigation/_components/minimap';

// Dynamic import for the map to avoid SSR issues with Leaflet
const ParkingNavigator = dynamic(
    () => import('@/app/navigation/_components/minimap'),
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
    // --- Logic from app/navigation/page.tsx ---
    const [isMapLoaded, setIsMapLoaded] = useState(false);
    const [isNearCar, setIsNearCar] = useState(false);
    const hasNotifiedRef = useRef(false);
    const PROXIMITY_THRESHOLD = 10; // meters
    
    const targetPosition = { lat: 48.263224370022066, lng: 11.6702772006254 };
    const { userLocation, errorMsg } = useLocation();
    const { orientation: heading, requestPermission, permissionState } = useDeviceOrientation();

    // Waypoints state
    const [waypointsState, setWaypointsState] = useState<Waypoint[]>([
        {
            id: 'wp-1',
            lat: 48.2625204266961,
            lng: 11.66880520591034,
            label: 'MI Exit',
            proximityRadius: 15,
        },
        {
            id: 'wp-2',
            lat: 48.262787118634016,
            lng: 11.669357032851115,
            label: 'Right Turn',
            proximityRadius: 15,
        },
        {
            id: 'wp-3',
            lat: 48.26269085236446,
            lng: 11.670038953560521,
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
                     window.dispatchEvent(new CustomEvent('carProximityReached', { 
                        detail: { distance, location: userLocation } 
                    }));
                }
            }
        } else if (distance !== null && distance > PROXIMITY_THRESHOLD + 5) {
             hasNotifiedRef.current = false;
        }
    }, [distance, userLocation, nextWaypoint]);

    // Handle waypoint reached
    const handleWaypointReached = (reachedWaypoint: Waypoint) => {
        setWaypointsState(prev => prev.map(wp => 
            wp.id === reachedWaypoint.id ? { ...wp, isReached: true } : wp
        ));
    };

    // --- UI Logic ---
    // Extract spot number from string like "Spot: #123"
    const spotString = car.spot || "123";
    const spotNumberMatch = spotString.match(/\d+/);
    const spotNumber = spotNumberMatch ? spotNumberMatch[0] : "---";
    const parkingRow = spotNumber.length > 0 ? spotNumber.charAt(0) : "?";

    // Compass Rotation Logic
    const compassRotation = heading !== null ? -heading : 0;
    const arrowRotation = targetAngle; 

    return (
        <motion.div
            key="step3-content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col h-full pb-4 gap-4"
        >
            {/* Compass Box */}
            <div className="bg-zinc-900 rounded-2xl py-6 border border-zinc-800 flex flex-col items-center justify-center shrink-0 shadow-lg relative overflow-hidden">
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
                    className="w-40 h-40 rounded-full border-2 border-zinc-800 flex items-center justify-center relative bg-black/20 shadow-inner transition-transform duration-300 ease-out"
                    style={{ transform: `rotate(${compassRotation}deg)` }}
                 >
                     {/* North Marker */}
                     <div className="absolute -top-1 w-2 h-5 bg-sixt-orange rounded-full shadow-[0_0_10px_#ff5f00]"></div>
                     
                     {/* Inner Circle */}
                     <div className="w-32 h-32 rounded-full border border-zinc-700/50 flex flex-col items-center justify-center relative">
                        {/* Arrow pointing to target */}
                        <div 
                            className="absolute inset-0 flex items-center justify-center transition-transform duration-300 ease-out"
                            style={{ transform: `rotate(${arrowRotation}deg)` }}
                        >
                             <NavigationIcon className="w-8 h-8 text-sixt-orange drop-shadow-[0_0_8px_rgba(255,95,0,0.8)]" />
                        </div>
                        
                        {/* Text Container - Counter rotate to keep upright */}
                        <div 
                            className="flex flex-col items-center justify-center z-10 bg-zinc-900/80 rounded-full w-20 h-20 backdrop-blur-sm"
                            style={{ transform: `rotate(${-compassRotation}deg)` }}
                        >
                            <div className="text-2xl font-bold text-white tracking-tighter">
                                {distance !== null ? Math.round(distance) : '---'}
                                <span className="text-xs text-zinc-500 font-normal ml-1">m</span>
                            </div>
                        </div>
                     </div>
                </div>
            </div>

            {/* Map Area */}
            <div className="flex-1 bg-zinc-900 rounded-2xl overflow-hidden border border-zinc-800 relative min-h-0 shadow-lg">
                <ParkingNavigator 
                    carLocation={targetPosition}
                    userLocation={userLocation}
                    onLoad={() => setIsMapLoaded(true)}
                    isNearCar={isNearCar}
                    waypoints={waypointsState}
                    onWaypointReached={handleWaypointReached}
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
