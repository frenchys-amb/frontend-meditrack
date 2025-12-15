import React from "react";
import { Card } from "@/components/ui/card";
import { Wrench, Gauge, Fuel, Wind, Droplets } from "lucide-react";
import { ChecklistFormState } from "@/types/forms";

interface MechanicalCheckCardProps {
  form: ChecklistFormState;
  onChange: (key: string, value: string) => void;
}

// Componente interno para los interruptores de fluidos (Toggle)
const FluidSwitch = ({ label, value, onClick }: { label: string; value: string; onClick: () => void }) => (
  <div
    onClick={onClick}
    className={`
      cursor-pointer flex flex-col items-center justify-center p-3 rounded-xl border transition-all duration-200
      ${value === 'Ok'
        ? 'bg-emerald-50 border-emerald-200 shadow-sm'
        : 'bg-red-50 border-red-200 shadow-sm'}
    `}
  >
    <span className={`text-xs font-bold uppercase mb-2 ${value === 'Ok' ? 'text-emerald-700' : 'text-red-700'}`}>
      {label}
    </span>

    {/* Visual del Switch */}
    <div className={`
      w-12 h-6 rounded-full p-1 transition-colors duration-300 flex items-center
      ${value === 'Ok' ? 'bg-emerald-500 justify-end' : 'bg-red-400 justify-start'}
    `}>
      <div className="w-4 h-4 bg-white rounded-full shadow-md" />
    </div>

    <span className="text-[10px] font-medium mt-1 text-slate-400">
      {value === 'Ok' ? 'Ok' : 'Bajo'}
    </span>
  </div>
);

export const MechanicalCheckCard: React.FC<MechanicalCheckCardProps> = ({ form, onChange }) => {
  return (
    <Card className="shadow-md border-slate-200 h-full overflow-hidden flex flex-col bg-white">

      {/* HEADER AZUL ACERO */}
      <div className="bg-slate-50 border-b border-slate-100 p-4 flex items-center gap-3">
        <div className="bg-white p-2 rounded-lg border border-slate-200 shadow-sm text-slate-600">
          <Wrench className="h-5 w-5" />
        </div>
        <h2 className="font-bold text-slate-800 text-base">Estado Mecánico</h2>
      </div>

      <div className="p-5 flex-1 space-y-8">

        {/* SECCIÓN 1: MEDICIONES (GRID CORREGIDO) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-6">

          {/* Millaje */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
              <Gauge className="w-3.5 h-3.5" /> Millaje
            </label>
            <input
              type="number"
              placeholder="Ej: 125000"
              className="w-full p-2.5 border border-slate-200 rounded-lg text-sm font-mono text-slate-700 focus:ring-2 focus:ring-slate-200 focus:border-slate-400 outline-none transition-all"
              value={form.millage}
              onChange={(e) => onChange("millage", e.target.value)}
            />
          </div>

          {/* Combustible */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
              <Fuel className="w-3.5 h-3.5" /> Combustible
            </label>
            <select
              className="w-full p-2.5 border border-slate-200 rounded-lg text-sm bg-white text-slate-700 focus:ring-2 focus:ring-slate-200 outline-none cursor-pointer"
              value={form.combustible}
              onChange={(e) => onChange("combustible", e.target.value)}
            >
              <option value="Full">Full (4/4)</option>
              <option value="ThreeQuarter">3/4 Tanque</option>
              <option value="Half">Medio (1/2)</option>
              <option value="Quarter">Cuarto (1/4)</option>
              <option value="Empty">Vacío (E)</option>
            </select>
          </div>

          {/* Oxígeno Main */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-blue-600 uppercase flex items-center gap-2">
              <Wind className="w-3.5 h-3.5" /> O₂ Principal (PSI)
            </label>
            <div className="relative">
              <input
                type="number"
                placeholder="2000"
                className="w-full p-2.5 border border-blue-100 bg-blue-50/30 rounded-lg text-sm font-mono text-slate-700 focus:ring-2 focus:ring-blue-100 focus:border-blue-300 outline-none"
                value={form.oxigeno_m}
                onChange={(e) => onChange("oxigeno_m", e.target.value)}
              />
              <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-bold">PSI</span>
            </div>
          </div>

          {/* Oxígeno Portátil */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-blue-600 uppercase flex items-center gap-2">
              <Wind className="w-3.5 h-3.5" /> O₂ Portátil
            </label>
            <div className="relative">
              <input
                type="number"
                placeholder="2000"
                className="w-full p-2.5 border border-blue-100 bg-blue-50/30 rounded-lg text-sm font-mono text-slate-700 focus:ring-2 focus:ring-blue-100 focus:border-blue-300 outline-none"
                value={form.oxigeno_e}
                onChange={(e) => onChange("oxigeno_e", e.target.value)}
              />
              <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-bold">PSI</span>
            </div>
          </div>
        </div>

        {/* SEPARADOR */}
        <div className="h-px bg-slate-100 w-full my-4" />

        {/* SECCIÓN 2: FLUIDOS (LAYOUT MEJORADO) */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="bg-sky-100 p-1.5 rounded-full">
              <Droplets className="h-3.5 w-3.5 text-sky-600" />
            </div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Niveles de Fluidos</span>
          </div>

          {/* Grid responsivo para los toggles */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <FluidSwitch
              label="Motor"
              value={form.nivel_aceite_motor}
              onClick={() => onChange("nivel_aceite_motor", form.nivel_aceite_motor === 'Ok' ? 'Low' : 'Ok')}
            />
            <FluidSwitch
              label="Transm."
              value={form.nivel_transmision}
              onClick={() => onChange("nivel_transmision", form.nivel_transmision === 'Ok' ? 'Low' : 'Ok')}
            />
            <FluidSwitch
              label="Frenos"
              value={form.nivel_frenos}
              onClick={() => onChange("nivel_frenos", form.nivel_frenos === 'Ok' ? 'Low' : 'Ok')}
            />
            <FluidSwitch
              label="Dirección"
              value={form.nivel_power_steering}
              onClick={() => onChange("nivel_power_steering", form.nivel_power_steering === 'Ok' ? 'Low' : 'Ok')}
            />
            <FluidSwitch
              label="Coolant"
              value={form.nivel_coolant}
              onClick={() => onChange("nivel_coolant", form.nivel_coolant === 'Ok' ? 'Low' : 'Ok')}
            />
          </div>
        </div>

      </div>
    </Card>
  );
};