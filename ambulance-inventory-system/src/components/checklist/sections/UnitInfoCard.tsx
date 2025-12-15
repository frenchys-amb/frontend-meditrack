import React from "react";
import { Card, Label, SelectStyled } from "@/components/checklist/shared/ChecklistUI";
import { ChecklistFormState } from "@/types/forms";

// Definición de tipo para la ambulancia
export interface Ambulance {
  id: string | number;
  unit_id: string; // Ej: "10", "45"
  plate_number?: string; // Ej: "M-12345"
  [key: string]: any;
}

interface UnitInfoCardProps {
  form: ChecklistFormState;
  ambulances: Ambulance[];
  onChange: (key: string, value: string) => void;
}

export const UnitInfoCard: React.FC<UnitInfoCardProps> = ({ form, ambulances, onChange }) => {
  return (
    <Card className="lg:col-span-4 p-5 h-fit">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-semibold text-slate-800">Unidad & Turno</h2>
      </div>

      <div className="space-y-5">

        {/* SELECTOR DE AMBULANCIA */}
        <div>
          <Label>Unidad Destino</Label>
          <SelectStyled
            // Usamos 'form.ambulance' porque es lo que controla el estado padre
            value={form.ambulance || ""}
            // Al cambiar, actualizamos la propiedad "ambulance" en el form padre
            onChange={(e) => onChange("ambulance", e.target.value)}
            disabled={ambulances.length === 0}
          >
            <option value="" disabled>Selecciona Unidad...</option>

            {ambulances.map((amb) => (
              // Usamos 'unit_id' como value porque así lo busca ChecklistPage
              <option key={amb.id} value={amb.unit_id}>
                🚑 Unidad {amb.unit_id} {amb.plate_number ? `(${amb.plate_number})` : ""}
              </option>
            ))}
          </SelectStyled>

          {ambulances.length === 0 && (
            <p className="text-xs text-slate-400 mt-1">Cargando unidades...</p>
          )}
        </div>

        {/* SELECTOR DE TURNO */}
        <div>
          <Label>Turno</Label>
          <SelectStyled
            value={form.shift}
            onChange={(e) => onChange("shift", e.target.value)}
          >
            <option value="5am-5pm">(5am - 5pm)</option>
            <option value="7am-7pm">(7am - 7pm)</option>
            <option value="9am-9pm">(9am - 9pm)</option>
            <option value="3pm-11pm">(3pm - 11pm)</option>
            <option value="7pm-7am">(7pm - 7am)</option>
            <option value="9pm-9am">(9pm - 9am)</option>
          </SelectStyled>
        </div>

      </div>
    </Card>
  );
};