// app/(dashboard)/dashboard/power-monitoring/power-factor/constants.ts

// Gauge bounds
export const MIN_VAL = 0;
export const MAX_VAL = 1;

// Gauge angles (deg)
export const START_ANGLE = -238;
export const END_ANGLE = 58;
export const ANGLE_RANGE = END_ANGLE - START_ANGLE;

// Chart axis
export const Y_DOMAIN: [number, number] = [0, 1];
export const Y_TICKS = [0.0, 0.2, 0.4, 0.6, 0.8, 1.0];

// Sampling & buffer
export const SAMPLE_MS = 2000;
export const MAX_POINTS = 15;

// Arc segments persis seperti kode asli
export const ARC_RED: [number, number] = [START_ANGLE, 300];
export const ARC_YELLOW: [number, number] = [300, 0];
export const ARC_LIME: [number, number] = [0, END_ANGLE];
