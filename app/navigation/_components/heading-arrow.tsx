"use client";
import React, { useEffect, useState } from "react";
import { useDeviceOrientation } from "../_hooks/use-device-orientation";


const SIXT_ORANGE = "#FF5F00";
const SIXT_DARK = "#222";


const ArrowSVG = ({ rotation = 0 }: { rotation: number }) => (
  <svg
    width="200"
    height="200"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 640 640"
    style={{
      transform: `rotate(${rotation}deg)`,
      willChange: 'transform',
      transformOrigin: 'center center'
    }}
  >
    <path fill="#FF5F00" d="M342.6 81.4C330.1 68.9 309.8 68.9 297.3 81.4L137.3 241.4C124.8 253.9 124.8 274.2 137.3 286.7C149.8 299.2 170.1 299.2 182.6 286.7L288 181.3L288 552C288 569.7 302.3 584 320 584C337.7 584 352 569.7 352 552L352 181.3L457.4 286.7C469.9 299.2 490.2 299.2 502.7 286.7C515.2 274.2 515.2 253.9 502.7 241.4L342.7 81.4z"/>
  </svg>
);

export default function HeadingArrow({ targetAngle = 0 }: { targetAngle?: number }) {
  const { orientation: heading, error, permissionState, requestPermission } = useDeviceOrientation();
  const [rotation, setRotation] = useState(0);
  const rotationRef = React.useRef(0);
  const targetRotationRef = React.useRef(0);
  const animationFrameRef = React.useRef<number | null>(null);

  useEffect(() => {
    if (heading !== null) {
      const targetRotation = (targetAngle - heading + 360) % 360;
      const prevRotation = rotationRef.current;
      let diff = targetRotation - (prevRotation % 360);

      if (diff > 180) {
        diff -= 360;
      } else if (diff < -180) {
        diff += 360;
      }

      targetRotationRef.current = prevRotation + diff;
    }
  }, [heading, targetAngle]);

  useEffect(() => {
    const smoothRotation = () => {
      const current = rotationRef.current;
      const target = targetRotationRef.current;
      const diff = target - current;

      if (Math.abs(diff) > 0.01) {
        const newRotation = current + diff * 0.2; // Smooth interpolation
        rotationRef.current = newRotation;
        setRotation(newRotation);
      }

      animationFrameRef.current = requestAnimationFrame(smoothRotation);
    };

    animationFrameRef.current = requestAnimationFrame(smoothRotation);

    return () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  if (permissionState === 'prompt') {
    return (
      <div className="flex flex-col items-center">
        <button
          onClick={requestPermission}
          style={{
            padding: '1rem 2rem',
            fontSize: '1.2rem',
            color: 'white',
            backgroundColor: SIXT_ORANGE,
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer'
          }}
        >
          Enable Compass
        </button>
        <p style={{ color: SIXT_DARK, marginTop: '1rem' }}>
          Please grant permission to access device orientation.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center">
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
