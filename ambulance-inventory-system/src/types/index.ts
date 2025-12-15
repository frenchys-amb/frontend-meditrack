// Tipos para autenticación y usuarios
export interface User {
  id: string;
  username: string;
  email: string;
  full_name: string | null;
  role: 'admin' | 'paramedic';
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

// -------------------------------------------------------------
// Tipos CONSOLIDADOS (NUEVOS) - Reflejan la estructura de Supabase
// -------------------------------------------------------------

/**
 * Representa un registro en la tabla consolidada 'storage_inventory'.
 * Combina StorageEquipment y StorageMedication.
 */
export interface StorageInventory {
  id: string;
  name: string;
  normalized_name: string;
  quantity: number;
  created_at: string;
  updated_at: string;
  created_by: string;

  // Campos específicos, ahora opcionales en la tabla unificada
  category?: string;          // Solo para Equipos
  expiration_date?: string;   // Solo para Medicamentos

  // CLAVE DE CONSOLIDACIÓN
  item_type: 'Equipment' | 'Medication';
}

/**
 * Representa un registro en la tabla consolidada 'ambulance_inventory'.
 * Combina AmbulanceEquipment y AmbulanceMedication.
 */
export interface AmbulanceInventory {
  id: string;
  ambulance_id: string;
  normalized_name: string;
  quantity: number;
  created_at: string;
  updated_at: string;

  // Referencia a la tabla maestra unificada (equipment_id o medication_id)
  item_master_id?: string;

  // Campos específicos
  category?: string;
  expiration_date?: string;

  // CLAVE DE CONSOLIDACIÓN
  item_type: 'Equipment' | 'Medication';
}


// -------------------------------------------------------------
// Tipos de Inventario Genérico (Ajustados)
// -------------------------------------------------------------

/**
 * Tipo genérico para ítems de inventario usados en mapeos de interfaz.
 */
export interface InventoryItem {
  id: string;
  normalized_name: string;
  name?: string;
  quantity: number;

  // Referencia maestra unificada
  item_master_id?: string;

  // Clave de tipo
  item_type: 'Equipment' | 'Medication';

  // Propiedades específicas
  category: keyof InventoryMaps;
  expiration_date?: string;
}

export interface InventoryMaps {
  Inmovilización: InventoryItem[];
  oxigeno_airway: InventoryItem[];
  canalizacion: InventoryItem[];
  miscelaneos: InventoryItem[];

  medicamentos: InventoryItem[];
  entubacion: InventoryItem[];
  equipo_general: InventoryItem[];
}

// -------------------------------------------------------------
// Tipos ANTIGUOS (DEJAR INCLUIDOS PARA COMPATIBILIDAD TEMPORAL, 
// PERO DEBEN ELIMINARSE TRAS LA MIGRACIÓN COMPLETA DEL CÓDIGO)
// -------------------------------------------------------------

export interface StorageEquipment {
  id: string;
  name: string;
  normalized_name: string;
  quantity: number;
  category: string;
  created_at: string;
  updated_at: string;
  created_by: string;
}

export interface StorageMedication {
  id: string;
  name: string;
  normalized_name: string;
  quantity: number;
  expiration_date: string;
  created_at: string;
  updated_at: string;
  created_by: string;
}

export interface AmbulanceEquipment {
  id: string;
  ambulance_id: string;
  equipment_id: string;
  normalized_name: string;
  quantity: number;
  category: string;
  created_at: string;
  updated_at: string;
}

export interface AmbulanceMedication {
  id: string;
  ambulance_id: string;
  medication_id: string;
  normalized_name: string;
  quantity: number;
  expiration_date: string;
  created_at: string;
  updated_at: string;
}

// -------------------------------------------------------------
// Tipos de Proceso (SIN CAMBIOS)
// -------------------------------------------------------------

export interface Ambulance {
  id: string;
  unit_id: string;
  created_at: string;
  updated_at: string;
}

export interface Checklist {
  id: string;
  ambulance_id: string;
  date: string;
  oxygen_m: number;
  oxygen_d: number;
  fuel: string;
  mileage: number;
  checklist_data: ChecklistData;
  created_at: string;
  updated_at: string;
  user_id: string;

  users?: {
    full_name: string;
  } | null;
}

export interface ChecklistData {
  [category: string]: {
    [itemName: string]: {
      recommended: number;
      current: number;
      completed: boolean;
    };
  };
}

export interface EquipmentUsage {
  id: string;
  ambulance_id: string;
  user_id: string;
  date: string;
  usage_data: {
    [itemName: string]: number;
  };
  created_at: string;
}

export interface Requisition {
  id: string;
  ambulance_id: string;
  user_id: string;
  date: string;
  requisition_data: {
    [itemName: string]: number;
  };
  created_at: string;
}

export interface ActivityLog {
  id: string;
  user_id: string;
  action: string;
  entity_type: string;
  entity_id: string;
  details: any;
  created_at: string;
}

export interface DashboardStats {
  totalEquipment: number;
  totalMedications: number;
  monthlyMovements: number;
  equipmentByCategory: {
    category: string;
    count: number;
  }[];
  criticalShortages: {
    name: string;
    current: number;
    recommended: number;
    category: string;
  }[];
}