"use client";

import dynamic from 'next/dynamic';
import { getDistance } from 'geolib';
import { useState, useEffect, useRef } from 'react';

import HeadingArrow from './_components/heading-arrow';
import { useLocation } from './_hooks/use-location';


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

    const vectorToTarget = userLocation
        ? {
            lat: targetPosition.lat - userLocation[0],
            lng: targetPosition.lng - userLocation[1],
        }
        : null;
    const targetAngle = vectorToTarget
        ? (Math.atan2(vectorToTarget.lng, vectorToTarget.lat) * 180) / Math.PI
        : 0;

    const distance = userLocation
        ? getDistance(
            { latitude: userLocation[0], longitude: userLocation[1] },
            { latitude: targetPosition.lat, longitude: targetPosition.lng }
        )
        : null;

    // Proximity detection effect
    useEffect(() => {
        if (distance !== null && distance <= PROXIMITY_THRESHOLD) {
            setIsNearCar(true);

            if (!hasNotifiedRef.current) {
                hasNotifiedRef.current = true;

                window.dispatchEvent(new CustomEvent('carProximityReached', { 
                    detail: { distance, location: userLocation } 
                }));
            }
        } else if (distance !== null && distance > PROXIMITY_THRESHOLD + 5) {
            setIsNearCar(false);
            hasNotifiedRef.current = false;
        }
    }, [distance, userLocation]);

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
            
            {isMapLoaded && <HeadingArrow targetAngle={targetAngle} distance={distance} />}
            <div style={{ marginTop: '20px' }}>
                <ParkingNavigator
                    carLocation={targetPosition}
                    userLocation={userLocation}
                    onLoad={() => setIsMapLoaded(true)}
                    isNearCar={isNearCar}
                />
            </div>
        </div>
    );
}