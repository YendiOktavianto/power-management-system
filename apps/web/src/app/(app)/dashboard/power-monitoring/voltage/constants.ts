// app/(dashboard)/dashboard/power-monitoring/voltage/constants.ts

// Gauge bounds
export const MIN_VAL = 0;
export const MAX_VAL = 300;

// Gauge angles (deg)
export const START_ANGLE = -238;
export const END_ANGLE = 58;
export const ANGLE_RANGE = END_ANGLE - START_ANGLE;

// Chart Y
export const Y_DOMAIN: [number, number] = [0, 300];
export const Y_TICKS = [0, 60, 120, 180, 240, 300];


// Sampling & buffer
export const SAMPLE_MS = 2000;
export const MAX_POINTS = 15;

// Arc segments persis seperti kode asli
export const ARC_RED:   [number, number] = [START_ANGLE, END_ANGLE];
export const ARC_YELLOW:   [number, number] = [310, 30];
export const ARC_LIME:  [number, number] = [326, 13];

export const V_RED_YELLOW_START = 191;
export const V_YELLOW_LIME_START = 207;
export const V_LIME_YELLOW_END = 254;
export const V_YELLOW_RED_END = 272;