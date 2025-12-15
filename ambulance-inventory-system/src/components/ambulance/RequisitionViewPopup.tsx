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
import { Download, Loader2, PackageOpen } from "lucide-react";
import { jsPDF } from "jspdf";

// --- INTERFACES ---
interface RequisitionItem {
  name: string;
  qty: number;
}

interface Requisition {
  id: string;
  date: string;
  created_at?: string;
  user_id: string;
  users?: { full_name: string };
  requisition_data: any;
}

interface RequisitionViewPopupProps {
  open: boolean;
  requisition: Requisition | null;
  unitId?: string;
  onClose: () => void;
}

const RequisitionViewPopup = ({
  open,
  requisition,
  unitId,
  onClose,
}: RequisitionViewPopupProps) => {

  const [paramedicName, setParamedicName] = useState<string>("Cargando...");

  // 1. Obtener nombre del paramédico
  useEffect(() => {
    const fetchParamedicName = async () => {
      if (!requisition) return;

      if (requisition.users?.full_name) {
        setParamedicName(requisition.users.full_name);
        return;
      }

      if (requisition.user_id) {
        setParamedicName("Buscando...");
        const { data: userData } = await supabase
          .from('users')
          .select('full_name')
          .eq('id', requisition.user_id)
          .maybeSingle();

        const userProfile = userData as any;
        if (userProfile) {
          setParamedicName(userProfile.full_name || "Nombre sin definir");
        } else {
          setParamedicName("Usuario desconocido");
        }
      } else {
        setParamedicName("N/A");
      }
    };

    if (open) {
      fetchParamedicName();
    }
  }, [requisition, open]);

  // 2. LÓGICA DE EXTRACCIÓN DE ÍTEMS
  const getItemsList = (): RequisitionItem[] => {
    if (!requisition?.requisition_data) return [];

    let data = requisition.requisition_data;

    // Si viene como string JSON
    if (typeof data === 'string') {
      try { data = JSON.parse(data); } catch (e) { return []; }
    }

    // CASO A: Formato Nuevo (Objeto con array 'items')
    if (data.items && Array.isArray(data.items)) {
      return data.items.map((i: any) => ({
        name: i.name || i.normalized_name || "Item sin nombre",
        qty: Number(i.missing_qty || i.quantity || i.cantidad || 0)
      }));
    }

    // CASO B: Formato Array Directo
    if (Array.isArray(data)) {
      return data.map((i: any) => ({
        name: i.name || i.normalized_name,
        qty: Number(i.missing_qty || i.quantity || 0)
      }));
    }

    // CASO C: Formato Legacy
    return Object.entries(data)
      .filter(([key]) => key !== 'generated_at' && key !== 'reason')
      .map(([key, value]) => ({
        name: key,
        qty: value as number
      }));
  };

  const items = getItemsList();

  const dateLabel = requisition?.created_at
    ? new Date(requisition.created_at).toLocaleString("es-ES")
    : requisition?.date
      ? new Date(requisition.date).toLocaleDateString("es-ES")
      : "";

  // 3. GENERAR PDF
  const downloadAsPDF = () => {
    if (!requisition) return;
    const doc = new jsPDF();

    // Encabezado
    doc.setFontSize(18); doc.setFont("helvetica", "bold");
    doc.text(`Requisición de Material`, 14, 20);

    // Info General
    doc.setFontSize(10); doc.setFont("helvetica", "normal");
    doc.text(`Unidad: ${unitId || "N/A"}`, 14, 30);
    doc.text(`Fecha: ${dateLabel}`, 14, 35);
    doc.text(`Solicitante: ${paramedicName}`, 14, 40);
    doc.text(`ID Ref: ${requisition.id.split('-')[0]}`, 14, 45);

    // Tabla de items
    let yPos = 55;
    doc.setDrawColor(200); doc.line(14, 50, 196, 50);

    // Cabecera Tabla Manual
    doc.setFont("helvetica", "bold");
    doc.setFillColor(240, 240, 240);
    doc.rect(14, yPos, 182, 8, 'F');
    doc.text("Descripción del Artículo", 16, yPos + 6);
    doc.text("Cant.", 170, yPos + 6);

    yPos += 14;
    doc.setFont("helvetica", "normal");

    // Corrección aquí: Eliminamos 'index' que no se usaba y tipamos 'item'
    items.forEach((item: RequisitionItem) => {
      if (yPos > 280) { doc.addPage(); yPos = 20; }

      doc.text(item.name, 16, yPos);
      doc.text(String(item.qty), 170, yPos);
      doc.line(14, yPos + 2, 196, yPos + 2);
      yPos += 8;
    });

    doc.save(`requisicion_${unitId}_${new Date().getTime()}.pdf`);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md md:max-w-2xl max-h-[90vh] overflow-hidden flex flex-col p-0 gap-0 bg-white">

        {/* HEADER CON ESTILO */}
        <div className="bg-slate-50 p-6 border-b border-slate-100">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-slate-800">Detalle de Requisición</DialogTitle>
            <DialogDescription className="mt-2 text-slate-500">
              Resumen de los insumos solicitados y descontados de bodega.
            </DialogDescription>
          </DialogHeader>

          {/* TARJETA DE INFO */}
          <div className="grid grid-cols-2 gap-4 mt-4 bg-white p-4 rounded-lg border border-slate-200 shadow-sm text-sm">
            <div>
              <p className="text-slate-400 text-xs uppercase font-bold tracking-wider">Unidad</p>
              <p className="font-semibold text-slate-800 text-lg">{unitId || "---"}</p>
            </div>
            <div className="text-right">
              <p className="text-slate-400 text-xs uppercase font-bold tracking-wider">Fecha</p>
              <p className="font-medium text-slate-700">{dateLabel}</p>
            </div>
            <div className="col-span-2 border-t pt-3 mt-1 flex justify-between items-center">
              <span className="text-slate-500">Solicitado por:</span>
              <span className="font-bold text-indigo-600 flex items-center gap-2">
                {paramedicName === "Buscando..." && <Loader2 className="h-3 w-3 animate-spin" />}
                {paramedicName}
              </span>
            </div>
          </div>
        </div>

        {/* CUERPO: TABLA DE ITEMS */}
        <div className="flex-1 overflow-y-auto p-6 bg-white">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-slate-400">
              <PackageOpen className="h-12 w-12 mb-2 opacity-20" />
              <p>No se encontraron items en esta solicitud.</p>
            </div>
          ) : (
            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <table className="min-w-full text-sm">
                <thead className="bg-slate-100 text-slate-600 font-semibold">
                  <tr>
                    <th className="px-4 py-3 text-left w-3/4">Descripción del Equipo / Medicamento</th>
                    <th className="px-4 py-3 text-center w-1/4">Cantidad</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {/* Corrección aquí: Tipamos item e index explícitamente */}
                  {items.map((item: RequisitionItem, index: number) => (
                    <tr key={index} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-4 py-3 text-slate-700 font-medium">
                        {item.name}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-100 min-w-[2rem]">
                          {item.qty}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* FOOTER */}
        <DialogFooter className="p-6 border-t border-slate-100 bg-slate-50">
          <div className="flex w-full justify-between sm:justify-end gap-3">
            <Button variant="outline" onClick={onClose} className="border-slate-300 text-slate-700">
              Cerrar
            </Button>
            <Button onClick={downloadAsPDF} disabled={!requisition || items.length === 0} className="bg-slate-900 hover:bg-slate-800 text-white">
              <Download className="h-4 w-4 mr-2" />
              Descargar PDF
            </Button>
          </div>
        </DialogFooter>

      </DialogContent>
    </Dialog>
  );
};

export default RequisitionViewPopup;