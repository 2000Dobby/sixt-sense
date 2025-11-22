"use client";

import dynamic from 'next/dynamic';
import { getDistance } from 'geolib';
import { useState, useEffect, useRef, useMemo } from 'react';

import HeadingArrow from './_components/heading-arrow';
import { useLocation } from './_hooks/use-location';
import type { Waypoint } from './_components/minimap';


const ParkingNavigator = dynamic(
    () => import('@/app/navigation/_components/minimap'),
    {
        ssr: false,
        loading: () => (
            <div className="w-full h-[30vh] bg-gray-800 animate-pulse rounded-xl overflow-hidden shadow-lg border-gray-700 flex items-center justify-center text-gray-400">
                Loading Map...
            </div>
        )
    }
);


export default function Navigation() {
    const [isMapLoaded, setIsMapLoaded] = useState(false);
    const [isNearCar, setIsNearCar] = useState(false);
    const hasNotifiedRef = useRef(false);
    const PROXIMITY_THRESHOLD = 10; // meters
    
    const targetPosition = { lat: 48.263224370022066, lng: 11.6702772006254 };
    const { userLocation, errorMsg } = useLocation();

    // Example waypoints - mix of regular waypoints and hidden POIs
    // These are static for demonstration but could be dynamic from an API
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
                queueMicrotask(() => setIsNearCar(true));

                window.dispatchEvent(new CustomEvent('carProximityReached', { 
                    detail: { distance, location: userLocation } 
                }));
            }
        } else if (distance !== null && distance > PROXIMITY_THRESHOLD + 5) {
            if (hasNotifiedRef.current) {
                queueMicrotask(() => setIsNearCar(false));
                hasNotifiedRef.current = false;
            }
        }
    }, [distance, userLocation]);

    // Event listener examples (for demonstration)
    useEffect(() => {
        const handleWaypointReached = (event: Event) => {
            const customEvent = event as CustomEvent;
            console.log('Waypoint reached:', customEvent.detail);
        };

        const handleHiddenPOIDiscovered = (event: Event) => {
            const customEvent = event as CustomEvent;
            alert(`Upgrade Car discovered: ${customEvent.detail || 'Unknown'}`);
        };

        window.addEventListener('waypointReached', handleWaypointReached);
        window.addEventListener('hiddenPOIDiscovered', handleHiddenPOIDiscovered);

        return () => {
            window.removeEventListener('waypointReached', handleWaypointReached);
            window.removeEventListener('hiddenPOIDiscovered', handleHiddenPOIDiscovered);
        };
    }, []);

    // Callback handlers for waypoints
    const handleWaypointReached = (waypoint: Waypoint) => {
        setWaypointsState(prev =>
            prev.map(wp => wp.id === waypoint.id ? { ...wp, isReached: true } : wp)
        );
    };

    const handleHiddenPOIDiscovered = (waypoint: Waypoint) => {
        setWaypointsState(prev =>
            prev.map(wp => wp.id === waypoint.id ? { ...wp, isReached: true } : wp)
        );
    };

    return (
        <div className="max-w-11/12 m-auto">
            <h1 className="text-4xl font-bold" style={{ color: "#FF5F00" }}>Head to your car</h1>
            {errorMsg && (
                <p className="text-red-500 text-center mt-2">{errorMsg}</p>
            )}

            {/* Proximity Alert */}
            {isNearCar && (
                <div className="mt-4 p-4 bg-green-600 text-white rounded-lg shadow-lg text-center animate-pulse">
                    <p className="text-2xl font-bold">🎉 You&apos;ve arrived!</p>
                    <p className="text-sm mt-1">You are within {PROXIMITY_THRESHOLD} meters of your car</p>
                </div>
            )}

            <h1>{nextWaypoint?.label}</h1>
            
            {isMapLoaded && <HeadingArrow targetAngle={targetAngle} distance={distance} />}
            <div style={{ marginTop: '20px' }}>
                <ParkingNavigator
                    carLocation={targetPosition}
                    userLocation={userLocation}
                    onLoad={() => setIsMapLoaded(true)}
                    isNearCar={isNearCar}
                    waypoints={waypointsState}
                    onWaypointReached={handleWaypointReached}
                    onHiddenPOIDiscovered={handleHiddenPOIDiscovered}
                />
            </div>
        </div>
    );
}