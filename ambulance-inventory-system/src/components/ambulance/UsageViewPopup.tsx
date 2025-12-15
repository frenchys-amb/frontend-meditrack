import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, Loader2, TrendingDown } from "lucide-react";
import { jsPDF } from "jspdf";

interface UsageLog {
  id: string;
  date: string;
  created_at?: string;
  user_id: string;
  users?: { full_name: string }; 
  usage_data: any;
}

interface UsageViewPopupProps {
  open: boolean;
  usageLog: UsageLog | null;
  unitId?: string;
  onClose: () => void;
}

const UsageViewPopup = ({
  open,
  usageLog,
  unitId,
  onClose,
}: UsageViewPopupProps) => {
  
  const [paramedicName, setParamedicName] = useState<string>("Cargando...");

  // ===========================================================================
  // LÓGICA CORREGIDA PARA TU TABLA 'USERS' (SOLO FULL_NAME)
  // ===========================================================================
  useEffect(() => {
    const fetchParamedicName = async () => {
      if (!usageLog) return;
      
      // 1. Si ya viene por el JOIN inicial (lo más rápido)
      if (usageLog.users?.full_name) {
        setParamedicName(usageLog.users.full_name);
        return;
      }

      if (usageLog.user_id) {
        setParamedicName("Consultando...");
        
        try {
          // CONSULTA EXACTA PARA TU ESTRUCTURA DE DATOS
          // Solo pedimos 'full_name' y 'username' porque 'first_name' no existe
          const { data, error } = await supabase
            .from('users') 
            .select('full_name, username, email')
            .eq('id', usageLog.user_id)
            .maybeSingle();

          if (error) {
            console.error("Error Supabase:", error);
            setParamedicName("Error de lectura");
            return;
          }

          if (data) {
            // Usamos full_name, y si está vacío, usamos el username
            const nombreFinal = data.full_name || data.username || data.email || "Usuario sin nombre";
            setParamedicName(nombreFinal);
          } else {
            console.warn("Usuario no encontrado en la tabla users");
            setParamedicName("Usuario desconocido");
          }

        } catch (err) {
          console.error("Error JS:", err);
          setParamedicName("Error");
        }
      } else {
        setParamedicName("ID no registrado");
      }
    };

    if (open) {
      fetchParamedicName();
    }
  }, [usageLog, open]);

  // --- Fecha ---
  const dateLabel =
    usageLog?.created_at
      ? new Date(usageLog.created_at).toLocaleString("es-ES")
      : usageLog?.date
      ? new Date(usageLog.date ?? new Date()).toLocaleDateString("es-ES")
      : "";

  // --- Procesar JSON de Gastos ---
  const getUsageItems = () => {
    if (!usageLog?.usage_data) return [];
    
    let data = usageLog.usage_data;
    if (typeof data === 'string') {
      try { data = JSON.parse(data); } catch (e) { return []; }
    }
    
    if (Array.isArray(data)) return data;
    if (data.item_name || data.name) return [data];
    return Object.keys(data).map(key => data[key]);
  };
  
  const items = getUsageItems();

  // --- PDF ---
  const downloadAsPDF = () => {
    if (!usageLog) return;
    const doc = new jsPDF();
    
    doc.setTextColor(220, 53, 69); // Rojo
    doc.setFontSize(16); doc.setFont("helvetica", "bold");
    doc.text(`Reporte de Gastos / Consumo`, 10, 15);
    
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12); doc.setFont("helvetica", "normal");
    doc.text(`Ambulancia: ${unitId || "N/A"}`, 10, 25);
    doc.text(`Fecha: ${dateLabel}`, 10, 32);
    
    // Nombre corregido
    doc.text(`Registrado por: ${paramedicName}`, 10, 39); 
    
    doc.text(`ID Ref: ${usageLog.id.slice(0, 8)}...`, 10, 46);
    
    doc.setDrawColor(200); doc.line(10, 50, 200, 50); 

    let yPosition = 60;
    doc.setFont("helvetica", "bold");
    doc.text("Item Consumido", 10, yPosition);
    doc.text("Cantidad", 150, yPosition);
    yPosition += 8;
    doc.setFont("helvetica", "normal");

    items.forEach((item: any) => {
      const nombre = item.item_name || item.name || "Sin nombre";
      const cantidad = item.quantity_used || item.quantity || 0;
      
      if (yPosition > 270) { doc.addPage(); yPosition = 20; }
      doc.text(`${nombre}`, 10, yPosition);
      doc.text(`${cantidad}`, 150, yPosition);
      yPosition += 8;
    });

    doc.save(`gastos-${unitId}-${usageLog.date}.pdf`);
  };

  const renderTable = () => (
    <div className="border rounded-md overflow-hidden mt-4 border-orange-100">
      <table className="min-w-full table-auto border-collapse bg-white text-sm">
        <thead className="bg-orange-50">
          <tr>
            <th className="px-4 py-3 border-b border-orange-100 text-left font-semibold text-orange-800">Item Consumido</th>
            <th className="px-4 py-3 border-b border-orange-100 text-left font-semibold text-orange-800 w-32">Cantidad</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item: any, index: number) => {
             const nombre = item.item_name || item.name || "Sin nombre";
             const cantidad = item.quantity_used || item.quantity || 0;
             return (
              <tr key={index} className="hover:bg-orange-50/30">
                <td className="px-4 py-2 border-b text-gray-800">{nombre}</td>
                <td className="px-4 py-2 border-b text-gray-800 font-bold text-red-600">-{cantidad}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center gap-2 text-orange-700">
            <TrendingDown className="h-6 w-6"/>
            Detalle de Gasto
          </DialogTitle>
          <DialogDescription asChild>
            <div className="flex flex-col gap-1 mt-2 text-sm text-gray-600 bg-orange-50 p-3 rounded-md border border-orange-100">
               <div className="flex justify-between">
                 <span className="font-semibold text-gray-900">Ambulancia:</span> 
                 <span>{unitId}</span>
               </div>
               <div className="flex justify-between">
                 <span className="font-semibold text-gray-900">Fecha:</span> 
                 <span>{dateLabel}</span>
               </div>
               <div className="flex justify-between items-center">
                 <span className="font-semibold text-gray-900">Registrado por:</span> 
                 <span className="font-bold text-orange-700 flex items-center gap-2">
                   {paramedicName === "Consultando..." && <Loader2 className="h-3 w-3 animate-spin"/>}
                   {paramedicName}
                 </span>
               </div>
            </div>
          </DialogDescription>
        </DialogHeader>

        {usageLog && (
          <div className="flex-1 overflow-y-auto pr-2">
            {items.length === 0 ? (
               <div className="text-center py-8 text-gray-400">No hay items en este registro</div>
            ) : (
               renderTable()
            )}
          </div>
        )}

        <DialogFooter className="mt-4 pt-2 border-t">
          <Button variant="outline" onClick={onClose}>Cerrar</Button>
          <Button 
            onClick={downloadAsPDF} 
            disabled={!usageLog || items.length === 0}
            className="bg-orange-600 hover:bg-orange-700 text-white"
          >
            <Download className="h-4 w-4 mr-2" /> PDF
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default UsageViewPopup;