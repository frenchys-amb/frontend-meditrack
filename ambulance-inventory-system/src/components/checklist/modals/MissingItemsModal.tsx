import React, { useState } from "react";
import { AlertTriangle, ArrowRight, X } from "lucide-react";

interface MissingItem {
  name: string;
  current: number;
  recommended: number;
  missing: number;
  section: string;
}

interface MissingItemsModalProps {
  missingItems: MissingItem[];
  onClose: () => void;
  // Ahora la función de "Pedir" acepta la lista modificada
  onRequestRestock: (customItems: any[]) => void;
  onConfirmWithoutRestock: () => void;
  isProcessing: boolean;
}

export const MissingItemsModal: React.FC<MissingItemsModalProps> = ({
  missingItems,
  onClose,
  onRequestRestock,
  onConfirmWithoutRestock,
  isProcessing,
}) => {
  // Estado para controlar los inputs manuales
  const [quantities, setQuantities] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    missingItems.forEach(item => {
      // Valor por defecto: Lo que calculó el sistema
      initial[item.name] = item.missing;
    });
    return initial;
  });

  const handleQuantityChange = (name: string, value: string) => {
    const num = parseInt(value);
    setQuantities(prev => ({ ...prev, [name]: isNaN(num) ? 0 : num }));
  };

  const handleConfirm = () => {
    // Preparamos la lista final con las cantidades que el usuario escribió
    const itemsToSend = missingItems.map(item => ({
      name: item.name,
      quantityToOrder: quantities[item.name] ?? item.missing, // Cantidad Manual
      section: item.section,
      current: item.current // Pasamos esto por si sirve de referencia
    })).filter(item => item.quantityToOrder > 0);

    onRequestRestock(itemsToSend);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">

        {/* Header */}
        <div className="bg-amber-50 p-6 border-b border-amber-100 flex gap-4 items-start">
          <div className="bg-amber-100 p-2 rounded-lg text-amber-600">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-amber-900">Faltantes Detectados</h3>
            <p className="text-sm text-amber-700 mt-1">
              Confirma las cantidades a solicitar. Puedes editar los números manualmente.
            </p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Tabla Editable */}
        <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 uppercase bg-slate-50 sticky top-0">
              <tr>
                <th className="px-4 py-3 rounded-l-lg">Item / Sección</th>
                <th className="px-4 py-3 text-center">Físico</th>
                <th className="px-4 py-3 text-center">Meta</th>
                <th className="px-4 py-3 text-center rounded-r-lg w-32 bg-amber-100/50 text-amber-800">A Pedir</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {missingItems.map((item) => (
                <tr key={item.name} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-4 py-3 font-medium text-slate-700">
                    <div className="font-bold">{item.name}</div>
                    <div className="text-[10px] text-slate-400 font-normal uppercase">{item.section}</div>
                  </td>
                  <td className="px-4 py-3 text-center text-slate-500">{item.current}</td>
                  <td className="px-4 py-3 text-center text-slate-500">{item.recommended}</td>
                  <td className="px-4 py-3 text-center">
                    <input
                      type="number"
                      min="0"
                      className="w-24 text-center p-2 border-2 border-slate-200 rounded-lg focus:border-amber-500 focus:ring-0 outline-none font-bold text-slate-900 bg-white shadow-sm"
                      value={quantities[item.name]}
                      onChange={(e) => handleQuantityChange(item.name, e.target.value)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end gap-3">
          <button
            onClick={onConfirmWithoutRestock}
            className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-200 rounded-lg text-sm"
          >
            Solo Guardar (No pedir)
          </button>

          <button
            onClick={handleConfirm}
            disabled={isProcessing}
            className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-6 py-2.5 rounded-lg font-bold text-sm shadow-md hover:shadow-lg transition-all disabled:opacity-70"
          >
            {isProcessing ? "Guardando..." : "Ir a Requisición"}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};