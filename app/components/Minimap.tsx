'use client';

import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// --- Types ---
export interface Waypoint {
    id: string;
    lat: number;
    lng: number;
    label: string;
    isHiddenPOI?: boolean; // Hidden Point of Interest
    poiType?: string; // Type of POI (e.g., 'elevator', 'stairs', 'landmark')
    proximityRadius?: number; // Radius in meters for triggering (default: 5)
    isReached?: boolean; // Track if waypoint has been reached
}

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

// --- Helper Component: Map Ready Handler ---
const MapReadyHandler = ({ onLoad }: { onLoad?: () => void }) => {
    const map = useMap();

    useEffect(() => {
        if (onLoad) {
            map.whenReady(() => {
                onLoad();
            });
        }
    }, [map, onLoad]);

    return null;
};

interface ParkingNavigatorProps {
    carLocation: { lat: number; lng: number };
    userLocation: [number, number] | null;
    onLoad?: () => void;
    isNearCar?: boolean;
    waypoints?: Waypoint[];
    onWaypointReached?: (waypoint: Waypoint) => void;
    onHiddenPOIDiscovered?: (waypoint: Waypoint) => void;
}

const ParkingNavigator: React.FC<ParkingNavigatorProps> = ({
    carLocation,
    userLocation,
    onLoad,
    isNearCar = false,
    waypoints = [],
    onWaypointReached,
    onHiddenPOIDiscovered
}) => {
    const notifiedWaypoints = React.useRef<Set<string>>(new Set());

    // Waypoint proximity detection
    React.useEffect(() => {
        if (!userLocation || waypoints.length === 0) return;

        waypoints.forEach((waypoint) => {
            if (waypoint.isReached || notifiedWaypoints.current.has(waypoint.id)) return;

            // Calculate distance in meters using Haversine formula
            const R = 6371e3; // Earth's radius in meters
            const lat1Rad = (userLocation[0] * Math.PI) / 180;
            const lat2Rad = (waypoint.lat * Math.PI) / 180;
            const deltaLat = ((waypoint.lat - userLocation[0]) * Math.PI) / 180;
            const deltaLng = ((waypoint.lng - userLocation[1]) * Math.PI) / 180;

            const a = Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
                Math.cos(lat1Rad) * Math.cos(lat2Rad) *
                Math.sin(deltaLng / 2) * Math.sin(deltaLng / 2);
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
            const distance = R * c;

            const proximityThreshold = waypoint.proximityRadius || 5;

            if (distance <= proximityThreshold) {
                notifiedWaypoints.current.add(waypoint.id);

                // Trigger appropriate event
                if (waypoint.isHiddenPOI) {
                    // Dispatch custom event for hidden POI discovery
                    window.dispatchEvent(new CustomEvent('hiddenPOIDiscovered', {
                        detail: {
                            waypoint,
                            distance,
                            userLocation,
                            timestamp: new Date().toISOString()
                        }
                    }));

                    onHiddenPOIDiscovered?.(waypoint);
                } else {
                    // Dispatch custom event for regular waypoint
                    window.dispatchEvent(new CustomEvent('waypointReached', {
                        detail: {
                            waypoint,
                            distance,
                            userLocation,
                            timestamp: new Date().toISOString()
                        }
                    }));

                    onWaypointReached?.(waypoint);
                }
            }
        });
    }, [userLocation, waypoints, onWaypointReached, onHiddenPOIDiscovered]);

    // Default view if no user location yet (centers on car)
    const center: [number, number] = [carLocation.lat, carLocation.lng];

    return (
        <div className="w-full h-full">


            {/* --- Map --- */}
            <MapContainer
                center={center}
                zoom={18}
                scrollWheelZoom={false}
                style={{ height: '100%', width: '100%' }}
                zoomControl={false}
                dragging={false}
            >
                <MapReadyHandler onLoad={onLoad} />
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                    url="https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png"
                />

                {/* Proximity Circle - shown when near car */}
                {isNearCar && (
                    <Circle
                        center={[carLocation.lat, carLocation.lng]}
                        radius={10}
                        pathOptions={{
                            color: '#00FF00',
                            fillColor: '#00FF00',
                            fillOpacity: 0.2,
                            weight: 2
                        }}
                    />
                )}

                {/* Car Marker */}
                <Marker position={[carLocation.lat, carLocation.lng]} icon={carIcon}>
                    <Popup>Your Car is here 🚗</Popup>
                </Marker>

                {/* Waypoints are invisible - only used for navigation path calculation */}

                {/* User Marker (Real-time) */}
                {userLocation && (
                    <>
                        <Marker position={userLocation} icon={userIcon}>
                            <Popup>You are here</Popup>
                        </Marker>

                        {/* Waypoint path - connect only unreached waypoints in order */}
                        {waypoints.length > 0 && (
                            <Polyline
                                positions={[
                                    userLocation,
                                    ...waypoints
                                        .filter(wp => !wp.isReached)
                                        .map(wp => [wp.lat, wp.lng] as [number, number]),
                                    [carLocation.lat, carLocation.lng]
                                ]}
                                pathOptions={{
                                    color: '#3B82F6',
                                    dashArray: '5, 10',
                                    opacity: 0.6,
                                    weight: 3
                                }}
                            />
                        )}

                        {/* Line connecting user to car (shown if no waypoints) */}
                        {waypoints.length === 0 && (
                            <Polyline
                                positions={[userLocation, [carLocation.lat, carLocation.lng]]}
                                pathOptions={{ color: '#FF5F00', dashArray: '10, 10', opacity: 0.8 }}
                            />
                        )}

                        {/* Auto-zoom logic */}
                        <MapUpdater userPos={userLocation} carPos={[carLocation.lat, carLocation.lng]} />
                    </>
                )}
            </MapContainer>
        </div>
    );
};

export default ParkingNavigator;
