export interface InventoryItem {
  id: string;
  normalized_name: string;
  name?: string;
  quantity: number;
  medication_id?: string;
  equipment_id?: string;
  category: keyof InventoryMaps;
}

export interface InventoryMaps {
  Inmovilización: InventoryItem[];
  oxigeno_airway: InventoryItem[];
  canalizacion: InventoryItem[];
  miscelaneos: InventoryItem[];

  medicamentos: InventoryItem[];
  entubacion: InventoryItem[];
  equipo: InventoryItem[];
}
