// app/(dashboard)/dashboard/power-monitoring/frequency/constants.ts

// Gauge range (Hz)
export const MIN_FREQ = 49;
export const MAX_FREQ = 51;

// Gauge angles (deg)
export const START_ANGLE = -238;
export const END_ANGLE = 58;
export const ANGLE_RANGE = END_ANGLE - START_ANGLE;

// Chart axis
export const Y_DOMAIN: [number, number] = [49, 51];
export const Y_TICKS = [49, 50, 51];

// Sampling & buffer
export const SAMPLE_MS = 2000;
export const MAX_POINTS = 15;

// Possible frequency values for dummy data
export const POSSIBLE_FREQ = [49, 50, 51];
