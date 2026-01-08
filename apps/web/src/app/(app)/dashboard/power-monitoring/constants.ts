import VoltageSection from "./voltage/Section";
import CurrentSection from "./current/Section";
import FrequencySection from "./frequency/Section";
import PowerFactorSection from "./power-factor/Section";
import PowerSection from "./power/Section";
import EnergyUsageSection from "./energy-usage/Section";

import type { SectionProps } from "./types";

export const POWER_SECTIONS = [
  { key: "Voltage",      id: "voltage" },
  { key: "Current",      id: "current" },
  { key: "Frequency",    id: "frequency" },
  { key: "Power Factor", id: "power-factor" },
  { key: "Power",        id: "power" },
  { key: "Energy Usage", id: "energy-usage" },
] as const;

export type PowerKey = typeof POWER_SECTIONS[number]["key"];

export const slugify = (s: string) => s.toLowerCase().replace(/ /g, "-");
export const TOP_OFFSET = 0;

export const SectionMap: Record<PowerKey, React.ComponentType<SectionProps>> = {
  Voltage: VoltageSection,
  Current: CurrentSection,
  Frequency: FrequencySection,
  "Power Factor": PowerFactorSection,
  Power: PowerSection,
  "Energy Usage": EnergyUsageSection,
};

const BASE = (process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4000').replace(/\/+$/, '');
const PREFIX = (process.env.NEXT_PUBLIC_API_PREFIX || '').replace(/^\/|\/$/g, '');

export const API_MON = PREFIX ? `${BASE}/${PREFIX}/monitoring-info` : `${BASE}/monitoring-info`;
export const API_MY_DEVICES = `${API_MON}/mine`;

export const USER_TOKEN_KEY = 'access_token_user';

