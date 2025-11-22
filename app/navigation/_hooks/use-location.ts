'use client';

import { useState, useEffect } from 'react';

export function useLocation() {
    const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
    const [errorMsg, setErrorMsg] = useState<string>('');

    useEffect(() => {
        if (!navigator.geolocation) {
            setErrorMsg('Geolocation is not supported by your browser');
            return;
        }

        const options = {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0,
        };

        const success = (position: GeolocationPosition) => {
            const { latitude, longitude } = position.coords;
            setUserLocation([latitude, longitude]);
            setErrorMsg(''); // Clear error on success
        };

        const error = (err: GeolocationPositionError) => {
            setErrorMsg(`GPS Error: ${err.message}`);
        };

        const id = navigator.geolocation.watchPosition(success, error, options);

        return () => navigator.geolocation.clearWatch(id);
    }, []); // Empty dependency array to run only once on mount

    return { userLocation, errorMsg };
}

