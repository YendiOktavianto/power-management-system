// app/(dashboard)/dashboard/power-monitoring/current/constants.ts

// Gauge bounds
export const MIN_CURRENT = 0;
export const MAX_CURRENT = 50;

// Range status (dipakai di line chart & gauge)
export const CURRENT_LIME_MAX = 30;    // normal
export const CURRENT_YELLOW_MAX = 40;  // warning, di atas ini merah

// Gauge angles
export const START_ANGLE = -238;
export const END_ANGLE = 58;
export const ANGLE_RANGE = END_ANGLE - START_ANGLE;

// Chart axis
export const Y_DOMAIN: [number, number] = [0, 50];
export const Y_TICKS = [0, 10, 20, 30, 40, 50];

// Colors
export const COLOR_GOOD = "lime";
export const COLOR_WARN = "yellow";
export const COLOR_DANGER = "red";
export const COLOR_NEEDLE = "dodgerblue";
export const GRID_STROKE = "#444";
export const LINE_STROKE = "#9bff5b";
export const AREA_FILL = "rgba(155,255,91,0.4)";

// Sampling interval (ms)
export const SAMPLE_MS = 2000;
// Max points in sparkline
export const MAX_POINTS = 15;
