import React, { useState } from "react";
import { Plus, Minus, CheckCircle, AlertCircle, RefreshCw, HelpCircle } from "lucide-react";
import { useInventoryStore } from "@/store/useInventoryStore";
// 1. Importamos el archivo estático SOLO para consultar cantidades
import { recommendedInventory } from "@/data/recommendedInventory";

interface Props {
  sectionName: string;
  ambulanceId: string;
  // 2. Recibimos la lista de nombres reales desde la DB
  dbItemList: string[]; 
}

export const InventorySection: React.FC<Props> = ({ sectionName, ambulanceId, dbItemList }) => {
  const { inventory, setInventory } = useInventoryStore();
  const [loadingItems, setLoadingItems] = useState<Record<string, boolean>>({});

  // --- LÓGICA HÍBRIDA ---
  // Obtenemos las recomendaciones estáticas para esta sección
  const staticRecommendations = recommendedInventory[sectionName as keyof typeof recommendedInventory] || {};

  // Si la lista de DB viene vacía (ej. error de carga), usamos la estática como respaldo
  const itemsToRender = (dbItemList && dbItemList.length > 0) 
    ? dbItemList 
    : Object.keys(staticRecommendations);

  // ... (La función handleTransfer se queda IGUAL que antes) ...
  const handleTransfer = async (itemName: string, change: number) => {
     // ... copia tu lógica de handleTransfer aquí ...
      // SIMULACIÓN LOCAL:
      const currentAmbQty = inventory.equipMap[itemName] || 0;
      const newQuantity = Math.max(0, currentAmbQty + change);
      const newInventory = {
        ...inventory,
        equipMap: { ...inventory.equipMap, [itemName]: newQuantity }
      };
      setInventory(newInventory);
  };
  // ...

  return (
    <div className="flex flex-col gap-3">
      {/* Cabecera ... igual ... */}

      {itemsToRender.map((itemName) => {
        // A. Cantidad Actual (Viene de la carga de InventoryStore)
        const currentQty = inventory.equipMap[itemName] || 0;

        // B. Cantidad Recomendada (Viene del Archivo Estático)
        // Si el admin agregó un item nuevo en Supabase que no está en el archivo, devolvemos 0 o undefined
        const recQty = staticRecommendations[itemName as keyof typeof staticRecommendations] || 0;
        
        // C. Lógica Visual
        // Si recQty es 0 (ítem nuevo sin configurar), asumimos que está "bien" si tiene al menos 1
        const isTargetMet = recQty > 0 ? currentQty >= recQty : currentQty > 0;
        const isLoading = loadingItems[itemName];

        return (
          <div key={itemName} className={`grid grid-cols-12 gap-2 items-center p-3 rounded-lg border transition-all ${isTargetMet ? "bg-white border-slate-100" : "bg-red-50 border-red-100"}`}>
            
            {/* Nombre */}
            <div className="col-span-4 sm:col-span-5 flex items-center gap-3 overflow-hidden">
               <div className={`flex-shrink-0 w-5 h-5 rounded flex items-center justify-center ${isTargetMet ? "bg-emerald-100 text-emerald-600" : "bg-red-100 text-red-500"}`}>
                  {isTargetMet ? <CheckCircle size={14} /> : <AlertCircle size={14} />}
               </div>
               <span className="text-sm font-medium truncate capitalize">
                 {itemName} {/* El nombre viene directo de la BD, así que siempre coincide */}
               </span>
            </div>

            {/* Recomendado (Híbrido) */}
            <div className="col-span-2 text-center">
              {recQty > 0 ? (
                <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded-md">
                  Rec: {recQty}
                </span>
              ) : (
                <span className="text-[10px] font-bold text-indigo-400 bg-indigo-50 px-2 py-1 rounded-md flex items-center justify-center gap-1" title="Ítem nuevo en BD, no configurado en archivo">
                  <HelpCircle size={10} /> Nuevo
                </span>
              )}
            </div>

            {/* Actual */}
            <div className="col-span-3 flex justify-center">
               <span className={`text-sm font-bold ${isTargetMet ? 'text-slate-800' : 'text-red-600'}`}>{currentQty}</span>
            </div>

            {/* Botones ... (Igual que antes) ... */}
            <div className="col-span-3 sm:col-span-2 flex items-center justify-center gap-1">
               <button onClick={() => handleTransfer(itemName, -1)} className="p-1.5 hover:bg-slate-100 text-slate-500"><Minus size={16}/></button>
               <button onClick={() => handleTransfer(itemName, 1)} className="p-1.5 hover:bg-indigo-50 text-indigo-600"><Plus size={16}/></button>
            </div>

          </div>
        );
      })}
    </div>
  );
};

export default InventorySection;