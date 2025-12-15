import React from "react";
import { Card, Label, SelectStyled, Icons } from "@/components/checklist/shared/ChecklistUI";
import { InventoryMaps } from "@/types/inventory";

interface InventoryManagerProps {
  selectedSection: string;
  onSelectSection: (section: string) => void;
  sectionLabels: Record<string, string>;
  recommendedInventory: any;
  inventory: InventoryMaps | null;
  checkedItems: Record<string, boolean>;
  onUpdateQuantity: (itemName: string, qty: number) => void;
  onManualCheck: (itemName: string, current: number, target: number) => void;
  onQuickFill: () => void;
}

export const InventoryManager: React.FC<InventoryManagerProps> = ({
  selectedSection,
  onSelectSection,
  sectionLabels,
  recommendedInventory,
  inventory,
  checkedItems,
  onUpdateQuantity,
  onManualCheck,
  onQuickFill,
}) => {
  
  const currentInventory = inventory || {} as InventoryMaps;
  const inventoryItems = selectedSection ? currentInventory[selectedSection as keyof InventoryMaps] || [] : [];

  return (
    <Card className="min-h-[600px] flex flex-col md:flex-row">
      {/* Sidebar: Menú de Categorías */}
      <div className="w-full md:w-64 bg-slate-50 border-b md:border-b-0 md:border-r border-slate-200 p-4">
        <div className="mb-4 md:hidden">
          <Label>Categoría</Label>
          <SelectStyled
            value={selectedSection}
            onChange={(e) => onSelectSection(e.target.value)}
          >
            <option value="">Seleccionar...</option>
            {Object.entries(sectionLabels).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </SelectStyled>
        </div>

        <div className="hidden md:block sticky top-20">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 px-2">Categorías</h3>
          <nav className="space-y-1">
            {Object.entries(sectionLabels).map(([key, label]) => {
              const isActive = selectedSection === key;
              return (
                <button
                  key={key}
                  onClick={() => onSelectSection(key)}
                  className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-white text-blue-600 shadow-sm ring-1 ring-slate-200'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  {label}
                </button>
              )
            })}
          </nav>
        </div>
      </div>

      {/* Lista de Items */}
      <div className="flex-1 flex flex-col bg-white">
        {/* Toolbar */}
        {selectedSection && (
          <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0 z-10">
            <div>
              <h2 className="text-lg font-bold text-slate-800">{sectionLabels[selectedSection]}</h2>
              <p className="text-sm text-slate-500">Verifique las cantidades físicas</p>
            </div>
            <button
              onClick={onQuickFill}
              className="inline-flex items-center gap-2 px-3 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 rounded-md text-sm font-medium transition-colors"
            >
              <Icons.Lightning />
              <span>Completar Sección</span>
            </button>
          </div>
        )}

        {/* Loop de Items */}
        <div className="flex-1 p-0 md:p-4 overflow-y-auto">
          {selectedSection ? (
            <div className="space-y-0 md:space-y-2">
              {(Object.entries(recommendedInventory[selectedSection] ?? {}) as [string, number][]).map(([itemName, targetQty]) => {
                const real = inventoryItems.find((i: any) => i.normalized_name.toLowerCase().trim() === itemName.toLowerCase().trim());
                const currentQty = real?.quantity ?? 0;
                
                // CORRECCIÓN: Solo está "checked" si el usuario interactuó manualmente.
                // Ya no confiamos en la base de datos automáticamente.
                const isChecked = checkedItems[itemName];

                // Rango dinámico
                const maxOption = Math.max(15, targetQty, currentQty);
                const quantityOptions = Array.from({ length: maxOption + 1 }, (_, i) => i);

                return (
                  <div
                    key={itemName}
                    className={`group flex flex-col sm:flex-row sm:items-center justify-between p-4 border-b md:border border-slate-100 md:rounded-lg transition-all ${
                      isChecked ? 'bg-slate-50/50' : 'bg-white hover:border-blue-200 hover:shadow-sm'
                    }`}
                  >
                    <div className="flex-1 mb-3 sm:mb-0">
                      <div className="flex items-center gap-2">
                        <span className={`font-medium text-sm ${isChecked ? 'text-slate-500 line-through decoration-slate-300' : 'text-slate-900'}`}>
                          {itemName}
                        </span>
                        
                        {/* Alerta Visual de faltante si el usuario seleccionó menos de lo requerido */}
                        {isChecked && currentQty < targetQty && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-700 border border-amber-200">
                            FALTA {targetQty - currentQty}
                          </span>
                        )}
                        {/* Indicador de "Pendiente" si no se ha tocado */}
                        {!isChecked && (
                             <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-500">
                                Pendiente
                             </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-400 mt-1">Requerido: {targetQty}</div>
                    </div>

                    <div className="flex items-center gap-3">
                      {/* SELECTOR DROPDOWN DE CANTIDAD */}
                      <div className="relative w-28">
                        <select
                          disabled={isChecked} // Bloquear si ya confirmó (debe desmarcar check para editar)
                          value={currentQty}
                          onChange={(e) => onUpdateQuantity(itemName, parseInt(e.target.value) || 0)}
                          className={`w-full h-9 pl-3 pr-8 text-sm font-semibold border rounded-md outline-none appearance-none cursor-pointer transition-all ${
                            isChecked
                              ? 'bg-slate-100 border-slate-200 text-slate-400'
                              : 'bg-white border-slate-200 text-slate-900 hover:border-blue-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
                          }`}
                        >
                          {quantityOptions.map((num) => (
                            <option key={num} value={num}>
                              {num === 0 ? "0" : num}
                            </option>
                          ))}
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none text-slate-400">
                          <Icons.ChevronDown />
                        </div>
                      </div>

                      <button
                        onClick={() => onManualCheck(itemName, currentQty, targetQty)}
                        className={`w-9 h-9 rounded-md flex items-center justify-center border transition-all ${
                          isChecked
                            ? 'bg-blue-600 border-blue-600 text-white shadow-sm'
                            : 'bg-white border-slate-200 text-slate-300 hover:border-blue-400 hover:text-blue-400'
                        }`}
                      >
                        <Icons.Check />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-10 text-slate-400">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                <Icons.Box />
              </div>
              <p className="text-sm font-medium">Selecciona una categoría para comenzar</p>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};