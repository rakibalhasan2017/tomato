import { create } from 'zustand';

export interface LocationContextType {
  locationLabel: string;
  locationError: string | null;
  isLocating: boolean;
  setLocationLabel: (label: string) => void;
  setLocationError: (error: string | null) => void;
  setIsLocating: (isLocating: boolean) => void;
}

export const useLocation = create<LocationContextType>((set) => ({
  locationLabel: 'Location not detected yet',
  locationError: null,
  isLocating: false,
  setLocationLabel: (label) => set({ locationLabel: label }),
  setLocationError: (error) => set({ locationError: error }),
  setIsLocating: (isLocating) => set({ isLocating }),
}));
