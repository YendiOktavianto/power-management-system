// app/(dashboard)/dashboard/power-monitoring/energy-usage/constants.ts

// Gauge bounds
export const MIN_VAL = 0;
export const MAX_VAL = 50;

// Gauge angles
export const START_ANGLE = -238;
export const END_ANGLE = 58;
export const ANGLE_RANGE = END_ANGLE - START_ANGLE;

// Chart axis
export const Y_DOMAIN: [number, number] = [0, 50];
export const Y_TICKS = [0, 10, 20, 30, 40, 50];

// Sampling
export const SAMPLE_MS = 2000;
export const MAX_POINTS = 15;
