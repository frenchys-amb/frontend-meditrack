// src/types/forms.ts

export interface ChecklistFormState {
    // --- Datos Generales ---
    date: string;
    ambulance: string | null;
    shift: string; // Turno (opcional)
    
  
    // --- Estado Mecánico y Operativo ---
    millage: number | string; // Puede ser string mientras escribes en el input
    combustible: string;      // "Full", "3/4", "1/2", "1/4", "E"
    
    // --- Oxígeno (Tanques M y E) ---
    oxigeno_m: number | string; // Tanque Principal
    oxigeno_e: number | string; // Tanque Portátil (Antes oxigeno_d)
  
    // --- Fluidos del Motor (Nuevos) ---
    nivel_aceite_motor: string;   // "Ok", "Bajo", "Critico"
    nivel_transmision: string;
    nivel_frenos: string;
    nivel_power_steering: string;
    nivel_coolant: string;        // Agua Radiador
  
    // --- Observaciones y Campos Dinámicos ---
    observaciones: string;
    
    // Esto permite acceder a propiedades dinámicas si agregas algo extra
    [key: string]: any; 
  }