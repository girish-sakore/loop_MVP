import { create } from "zustand";

type UiState = {
  isMapNavVisible: boolean;
  toggleMapNav: () => void;
  setMapNavVisible: (visible: boolean) => void;
};

export const useUiStore = create<UiState>((set) => ({
  isMapNavVisible: false,
  toggleMapNav: () => set((s) => ({ isMapNavVisible: !s.isMapNavVisible })),
  setMapNavVisible: (visible) => set({ isMapNavVisible: visible }),
}));