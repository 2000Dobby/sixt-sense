"use client";
import { useState, useEffect, useCallback } from 'react';

type DeviceOrientationEventiOS = DeviceOrientationEvent & {
  webkitCompassHeading?: number;
};

export function useDeviceOrientation() {
  const [orientation, setOrientation] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [permissionState, setPermissionState] = useState<'granted' | 'denied' | 'prompt'>('prompt');

  const handleOrientation = useCallback((event: DeviceOrientationEvent) => {
    const eventiOS = event as DeviceOrientationEventiOS;
    let compass: number | null = null;
    if (typeof eventiOS.webkitCompassHeading === 'number') {
      compass = eventiOS.webkitCompassHeading;
    } else if (event.alpha !== null) {
      compass = 360 - event.alpha;
    }

    if (compass !== null) {
      setOrientation((compass + 360) % 360);
      setError(null);
    } else {
      setError("Compass data unavailable.");
    }
  }, []);

  const requestPermission = useCallback(async () => {
    if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
      try {
        const permission = await (DeviceOrientationEvent as any).requestPermission();
        if (permission === 'granted') {
          setPermissionState('granted');
          window.addEventListener('deviceorientationabsolute', handleOrientation);
          window.addEventListener('deviceorientation', handleOrientation);
        } else {
          setPermissionState('denied');
          setError('Permission to access device orientation was denied.');
        }
      } catch (e) {
        setError('Error requesting device orientation permission.');
        console.error(e);
      }
    } else {
      setPermissionState('granted');
      window.addEventListener('deviceorientationabsolute', handleOrientation);
    }
  }, [handleOrientation]);

  useEffect(() => {
    if (typeof window.DeviceOrientationEvent === 'undefined') {
      setError("Device orientation not supported.");
      return;
    }

    if (typeof (DeviceOrientationEvent as any).requestPermission !== 'function') {
      setPermissionState('granted');
      window.addEventListener('deviceorientationabsolute', handleOrientation);
    }

    return () => {
      window.removeEventListener('deviceorientationabsolute', handleOrientation);
    };
  }, [handleOrientation]);

  return { orientation, error, permissionState, requestPermission };
}

