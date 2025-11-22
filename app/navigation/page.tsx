"use client";

import dynamic from 'next/dynamic';

import HeadingArrow from './_components/heading-arrow';


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

    return (
        <div className="max-w-11/12 m-auto">
            <h1 className="text-4xl font-bold" style={{ color: "#FF5F00" }}>Head to your car</h1>
            <HeadingArrow targetAngle={0} />
            <div style={{ marginTop: '20px' }}>
                <ParkingNavigator
                    carLocation={targetPosition}
                />
            </div>
        </div>
    );
}