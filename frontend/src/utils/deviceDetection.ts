/**
 * Device detection utilities for responsive design adaptation.
 * Provides screen dimension detection and device type classification.
 */

import { useState, useEffect } from 'react';

export type DeviceType = 'mobile' | 'tablet' | 'desktop';

export type ScreenDimensions = {
  width: number;
  height: number;
  aspectRatio: number;
  orientation: 'portrait' | 'landscape';
  deviceType: DeviceType;
  isTouch: boolean;
  pixelRatio: number;
};

const MOBILE_BREAKPOINT = 768;
const TABLET_BREAKPOINT = 1024;

/**
 * Detect device type based on viewport width.
 */
export const getDeviceType = (width: number): DeviceType => {
  if (width < MOBILE_BREAKPOINT) return 'mobile';
  if (width < TABLET_BREAKPOINT) return 'tablet';
  return 'desktop';
};

/**
 * Detect if the current environment supports touch events.
 */
export const isTouchDevice = (): boolean => {
  if (typeof window === 'undefined') return false;
  return (
    'ontouchstart' in window ||
    navigator.maxTouchPoints > 0 ||
    // @ts-expect-error - navigator.msMaxTouchPoints is IE-specific
    navigator.msMaxTouchPoints > 0
  );
};

/**
 * Get current screen dimensions and device information.
 * Returns null if window is not available (SSR safety).
 */
export const getScreenDimensions = (): ScreenDimensions | null => {
  if (typeof window === 'undefined') return null;

  const width = window.innerWidth;
  const height = window.innerHeight;
  const deviceType = getDeviceType(width);
  const orientation = width > height ? 'landscape' : 'portrait';
  const pixelRatio = window.devicePixelRatio || 1;

  return {
    width,
    height,
    aspectRatio: Math.round((width / height) * 100) / 100,
    orientation,
    deviceType,
    isTouch: isTouchDevice(),
    pixelRatio,
  };
};

/**
 * Hook-friendly version that returns dimensions with optional reactive updates.
 * Use in combination with useState/useEffect for reactive dimension tracking.
 */
export const useScreenDimensions = () => {
  const [dimensions, setDimensions] = useState<ScreenDimensions | null>(null);

  useEffect(() => {
    const handleResize = () => {
      setDimensions(getScreenDimensions());
    };

    // Initial read deferred to avoid synchronous setState in effect
    const timer = setTimeout(() => {
      setDimensions(getScreenDimensions());
    }, 0);

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timer);
    };
  }, []);

  return dimensions;
};
