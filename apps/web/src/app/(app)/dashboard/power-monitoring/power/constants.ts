// app/(dashboard)/dashboard/power-monitoring/power/constants.ts

// Gauge bounds (W)
export const MIN_VAL = 0;
export const MAX_VAL = 4000;

// Gauge angles (deg)
export const START_ANGLE = -238;
export const END_ANGLE = 58;
export const ANGLE_RANGE = END_ANGLE - START_ANGLE;

// Chart axis
export const Y_DOMAIN: [number, number] = [0, 4000];
export const Y_TICKS = [0, 400, 800, 1200, 1600, 2000, 2400, 2800, 3200, 3600, 4000];

// Sampling & buffer
export const SAMPLE_MS = 2000;
export const MAX_POINTS = 15;

// Arc segments (tetap seperti kode asli)
export const ARC_RED: [number, number] = [START_ANGLE, END_ANGLE];
export const ARC_YELLOW: [number, number] = [-60, 10];
export const ARC_LIME: [number, number] = [START_ANGLE, -60];
