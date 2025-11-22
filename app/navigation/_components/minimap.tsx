'use client';

import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import { getDistance } from 'geolib'; // Helpful for calculating distance
import 'leaflet/dist/leaflet.css';

// --- Configuration ---
// Custom Icons to avoid Next.js/Leaflet asset loading issues
const createIcon = (color: string, className: string = '') => {
    return L.divIcon({
        className: className,
        html: `<div style="background-color: ${color}; width: 100%; height: 100%; border-radius: 50%; border: 2px solid white;"></div>`,
        iconSize: [20, 20],
        iconAnchor: [10, 10],
    });
};

const userIcon = L.divIcon({
    className: 'smooth-marker-icon', // Points to our CSS transition
    html: '<div class="user-pulse"></div>',
    iconSize: [20, 20],
    iconAnchor: [10, 10],
});

const carIcon = createIcon('#FF5F00'); // Sixt Orange dot for car

// --- Helper Component: Auto-Center Map ---
// Keeps the map bounds containing both user and car
const MapUpdater = ({ userPos, carPos }: { userPos: [number, number], carPos: [number, number] }) => {
    const map = useMap();

    useEffect(() => {
        if (userPos && carPos) {
            const bounds = L.latLngBounds([userPos, carPos]);
            // Add padding so points aren't on the very edge
            map.fitBounds(bounds, { padding: [50, 50], animate: true });
        }
    }, [map, userPos, carPos]);

    return null;
};

interface ParkingNavigatorProps {
    carLocation: { lat: number; lng: number };
    userLocation: [number, number] | null;
    errorMsg: string;
}

const ParkingNavigator: React.FC<ParkingNavigatorProps> = ({ carLocation, userLocation, errorMsg }) => {
    const [distance, setDistance] = useState<number | null>(null);

    // Helper to calculate distance
    const updateDistance = (userLat: number, userLng: number) => {
        const dist = getDistance(
            { latitude: userLat, longitude: userLng },
            { latitude: carLocation.lat, longitude: carLocation.lng }
        );
        setDistance(dist);
    };

    useEffect(() => {
        if (userLocation) {
            const [latitude, longitude] = userLocation;
            updateDistance(latitude, longitude);
        }
    }, [userLocation, carLocation]);

    // Default view if no user location yet (centers on car)
    const center: [number, number] = [carLocation.lat, carLocation.lng];

    return (
        <div className="w-full h-[30vh] relative rounded-xl overflow-hidden shadow-lg border-gray-700">

            {/* --- Floating Info Panel --- */}
            <div className="absolute top-4 left-4 z-[1000] bg-black/80 backdrop-blur-sm p-4 rounded-lg shadow-md max-w-xs">
                <h3 className="font-bold text-white">Find My Car</h3>
                {errorMsg ? (
                    <p className="text-red-400 text-sm">{errorMsg}</p>
                ) : (
                    <div className="mt-2">
                        <p className="text-sm text-gray-300">Distance remaining:</p>
                        <p className="text-2xl font-bold text-[#FF5F00]">
                            {distance !== null ? `${distance} meters` : 'Locating...'}
                        </p>
                    </div>
                )}
            </div>

            {/* --- Map --- */}
            <MapContainer
                center={center}
                zoom={18}
                scrollWheelZoom={false}
                style={{ height: '100%', width: '100%' }}
                zoomControl={false}
                dragging={false}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                    url="https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png"
                />

                {/* Car Marker */}
                <Marker position={[carLocation.lat, carLocation.lng]} icon={carIcon}>
                    <Popup>Your Car is here 🚗</Popup>
                </Marker>

                {/* User Marker (Real-time) */}
                {userLocation && (
                    <>
                        <Marker position={userLocation} icon={userIcon}>
                            <Popup>You are here</Popup>
                        </Marker>

                        {/* Line connecting user to car */}
                        <Polyline
                            positions={[userLocation, [carLocation.lat, carLocation.lng]]}
                            pathOptions={{ color: '#FF5F00', dashArray: '10, 10', opacity: 0.8 }}
                        />

                        {/* Auto-zoom logic */}
                        <MapUpdater userPos={userLocation} carPos={[carLocation.lat, carLocation.lng]} />
                    </>
                )}
            </MapContainer>
        </div>
    );
};

export default ParkingNavigator;