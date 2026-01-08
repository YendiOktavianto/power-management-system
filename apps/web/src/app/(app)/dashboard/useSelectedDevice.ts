// stores/useSelectedDevice.ts
import { create } from "zustand";

type SelectedDeviceStore = {
  deviceId: string | null;
  setDeviceId: (id: string | null) => void;
};

export const useSelectedDevice = create<SelectedDeviceStore>((set) => ({
  deviceId: null,
  setDeviceId: (deviceId) => set({ deviceId }),
}));
