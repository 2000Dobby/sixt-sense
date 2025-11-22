"use client";

import dynamic from 'next/dynamic';

import HeadingArrow from './_components/heading-arrow';
import { useLocation } from './_hooks/use-location';


const ParkingNavigator = dynamic(
    () => import('@/app/navigation/_components/minimap'),
    {
        ssr: false,
        loading: () => (
            <div className="w-full h-[500px] bg-gray-100 animate-pulse rounded-xl flex items-center justify-center text-gray-400">
                Initializing GPS...
            </div>
        )
    }
);


export default function Navigation() {
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

    return (
        <div className="max-w-11/12 m-auto">
            <h1 className="text-4xl font-bold" style={{ color: "#FF5F00" }}>Head to your car</h1>
            <HeadingArrow targetAngle={targetAngle} />
            <div style={{ marginTop: '20px' }}>
                <ParkingNavigator
                    carLocation={targetPosition}
                    userLocation={userLocation}
                    errorMsg={errorMsg}
                />
            </div>
        </div>
    );
}