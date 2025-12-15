import { create } from "zustand";
import { InventoryMaps } from "../types/inventory";
import { EMPTY_INVENTORY } from "../data/constants";

interface InventoryState {
  ambulanceId: string | null;
  inventory: InventoryMaps;
  setAmbulance: (id: string | null) => void;
  setInventory: (data: InventoryMaps) => void;
}

export const useInventoryStore = create<InventoryState>((set) => ({
  ambulanceId: null,
  inventory: EMPTY_INVENTORY,
  setAmbulance: (id) => set({ ambulanceId: id }),
  setInventory: (data) => set({ inventory: data }),
}));
