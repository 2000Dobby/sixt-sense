"use client";
import React, { useEffect, useState } from "react";

// Sixt color scheme
const SIXT_ORANGE = "#FF5F00";
const SIXT_DARK = "#222";

// Enhanced SVG arrow with Sixt design
const ArrowSVG = ({ rotation = 0 }: { rotation: number }) => (
  <svg width="90" height="90" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" style={{ transform: `rotate(${rotation}deg)`, transition: 'transform 0.3s cubic-bezier(.4,2,.6,1)' }}>
    <path fill="#FF5F00" d="M342.6 81.4C330.1 68.9 309.8 68.9 297.3 81.4L137.3 241.4C124.8 253.9 124.8 274.2 137.3 286.7C149.8 299.2 170.1 299.2 182.6 286.7L288 181.3L288 552C288 569.7 302.3 584 320 584C337.7 584 352 569.7 352 552L352 181.3L457.4 286.7C469.9 299.2 490.2 299.2 502.7 286.7C515.2 274.2 515.2 253.9 502.7 241.4L342.7 81.4z"/>
  </svg>
);

export default function NorthArrow({ targetAngle = 0 }: { targetAngle?: number }) {
  const [heading, setHeading] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let animationFrame: number;
    function handleOrientation(event: DeviceOrientationEvent) {
      // Prefer absolute heading if available
      let compass: number | null = null;
      // @ts-expect-error iOS Safari uses webkitCompassHeading, not standard
      if (typeof event.webkitCompassHeading === 'number') {
        // iOS Safari absolute heading
        // @ts-expect-error iOS Safari uses webkitCompassHeading, not standard
        compass = event.webkitCompassHeading;
      } else if (event.absolute && typeof event.alpha === 'number') {
        // Absolute heading (0 = north)
        compass = 360 - event.alpha;
      } else if (typeof event.alpha === 'number') {
        // Fallback: relative heading
        compass = 360 - event.alpha;
      }
      if (compass !== null) {
        animationFrame = window.requestAnimationFrame(() => {
          setHeading((compass + 360) % 360); // Normalize
          setError(null);
        });
      } else {
        animationFrame = window.requestAnimationFrame(() => {
          setError("Compass data unavailable.");
        });
      }
    }

    // Prefer deviceorientationabsolute if available
    if (typeof window !== 'undefined' && typeof window.DeviceOrientationEvent !== 'undefined') {
      const win: Window & { ondeviceorientationabsolute?: any; addEventListener: any; } = window as any;
      if (typeof win.ondeviceorientationabsolute !== 'undefined') {
        win.addEventListener('deviceorientationabsolute', handleOrientation);
        console.log('Using deviceorientationabsolute event.');
      } else {
        window.addEventListener('deviceorientation', handleOrientation);
        console.log('Using deviceorientation event.');
      }
    } else {
      animationFrame = window.requestAnimationFrame(() => {
        setError("Device orientation not supported.");
      });
    }

    return () => {
      window.removeEventListener('deviceorientationabsolute', handleOrientation);
      window.removeEventListener('deviceorientation', handleOrientation);
      if (animationFrame) window.cancelAnimationFrame(animationFrame);
    };
  }, []);

  // Calculate the rotation needed to point the arrow at the target angle
  // Arrow points north by default, so rotate by (targetAngle - heading)
  let rotation = 0;
  if (heading !== null) {
    rotation = (targetAngle - heading + 360) % 360;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: 40 }}>
      {heading !== null ? (
        <>
          <ArrowSVG rotation={rotation} />
          <div style={{ marginTop: 10, color: SIXT_DARK, fontWeight: 600 }}>
            Heading: {heading.toFixed(0)}°<br />
            Arrow points to: {targetAngle}°
          </div>
        </>
      ) : (
        <div style={{ color: SIXT_ORANGE, fontSize: "5rem" }}>{error || '...'}</div>
      )}
    </div>
  );
}
