import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileDown, Droplets, Box, User, Fuel, Gauge, Loader2, Clock, HeartPulse } from "lucide-react"; // Se añadió HeartPulse

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// --- INTERFACES (NO MODIFICADAS) ---
interface InventoryItem {
  id?: string;
  name?: string;      // Formato Viejo
  quantity?: number;  // Formato Viejo
  n?: string;         // Formato Nuevo (Ligero)
  q?: number;         // Formato Nuevo (Ligero)
  category?: string;
  normalized_name?: string;
}

interface ChecklistData {
  fluids?: Record<string, string>;
  observations?: string;
  inventory_snapshot?: Record<string, InventoryItem[]>;
  // Campo que viene directo de la DB:
  medical_equipment?: Record<string, string>;
}

interface Checklist {
  id: string;
  ambulance_id: string;
  date: string;
  created_at?: string;
  user_id?: string;
  oxygen_m?: number;
  oxygen_d?: number;
  fuel?: string;
  mileage?: number;
  shift?: string;
  checklist_data: ChecklistData;
  ambulances?: { unit_id: string };
  users?: { full_name: string };
}

interface ChecklistViewPopupProps {
  open: boolean;
  checklist: Checklist | null;
  unitId?: string;
  onClose: () => void;
}

const ChecklistViewPopup = ({
  open,
  checklist,
  unitId,
  onClose,
}: ChecklistViewPopupProps) => {

  const [responsibleName, setResponsibleName] = useState<string>("Cargando...");

  useEffect(() => {
    const fetchUserName = async () => {
      if (!checklist) return;

      if (checklist.users?.full_name) {
        setResponsibleName(checklist.users.full_name);
        return;
      }

      if (checklist.user_id) {
        setResponsibleName("Buscando...");

        const { data: userData } = await supabase
          .from('users')
          .select('full_name')
          .eq('id', checklist.user_id)
          .maybeSingle();

        const userProfile = userData as any;

        if (userProfile && userProfile.full_name) {
          setResponsibleName(userProfile.full_name);
        } else {
          setResponsibleName("Usuario no encontrado");
        }
      } else {
        setResponsibleName("Sin ID de usuario");
      }
    };

    if (open) {
      fetchUserName();
    }
  }, [checklist, open]);

  const displayAmbulance = checklist?.ambulances?.unit_id
    ? checklist.ambulances.unit_id
    : (unitId || checklist?.ambulance_id || "-");

  const formatText = (text: string) => {
    return text.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  };

  // --- FUNCIÓN DE TRADUCCIÓN DE CATEGORÍA ---
  // Ahora solo se usa para los nombres de las categorías de inventory_snapshot
  const translateCategory = (categoryKey: string) => {
    const key = categoryKey.toLowerCase();

    // Si la categoría de inventario es 'oxigeno_airway', se ve mejor como 'Oxígeno/Vía Aérea'
    if (key === 'oxigeno_airway') return 'Oxígeno y Vía Aérea';
    if (key === 'equipo_general') return 'Equipo General';
    if (key === 'inmovilizacion') return 'Inmovilización';

    return formatText(categoryKey);
  }

  // --- FUNCIÓN PARA PROCESAR EQUIPO MÉDICO ({item: status} a {name: item, quantity: status}) ---
  const processMedicalEquipment = (data: Record<string, string> | undefined) => {
    if (!data) return [];

    return Object.entries(data).map(([key, value]) => ({
      name: formatText(key),
      status: value // Usamos 'status' en lugar de 'quantity'
    }));
  }


  // --- CORRECCIÓN DE SHIFT (función previa no modificada) ---
  const formatShift = (shiftValue?: string) => {
    if (!shiftValue) return "N/A";

    const normalizedShift = shiftValue.toLowerCase();

    if (normalizedShift.includes("morning") || normalizedShift.includes("5am")) return "5:00 AM - 5:00 PM";
    if (normalizedShift.includes("night") || normalizedShift.includes("5pm")) return "5:00 PM - 5:00 AM";

    return shiftValue;
  };

  // --- FUNCIÓN DE NORMALIZACIÓN (Inventario) ---
  const normalizeItem = (item: InventoryItem) => {
    return {
      name: item.name || item.n || "Item Desconocido",
      quantity: item.quantity ?? item.q ?? 0
    };
  };

  // --- PDF ---
  const generatePDF = () => {
    if (!checklist) return;

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;

    doc.setFontSize(18);
    doc.text("Reporte de Inspección de Ambulancia", pageWidth / 2, 15, { align: "center" });

    doc.setFontSize(10);
    doc.text(`Generado el: ${new Date().toLocaleString("es-ES")}`, pageWidth / 2, 22, { align: "center" });

    doc.setFontSize(11);
    doc.setTextColor(40);
    const startY = 35;

    doc.text(`Unidad: ${displayAmbulance}`, 14, startY);
    doc.text(`Responsable: ${responsibleName}`, 14, startY + 6);
    doc.text(`Fecha Registro: ${checklist.date}`, 14, startY + 12);
    doc.text(`Turno: ${formatShift(checklist.shift)}`, 14, startY + 18);

    doc.text(`Combustible: ${checklist.fuel || "-"}`, 120, startY);
    doc.text(`Millaje: ${checklist.mileage || "-"}`, 120, startY + 6);
    doc.text(`Oxígeno (M/D): ${checklist.oxygen_m}/${checklist.oxygen_d}`, 120, startY + 12);

    let currentY = startY + 25;

    // Fluidos
    const fluids = checklist.checklist_data?.fluids || {};
    if (Object.keys(fluids).length > 0) {
      doc.setFontSize(14);
      doc.setTextColor(0, 51, 102);
      doc.text("Estado de Fluidos", 14, currentY);

      const fluidRows = Object.entries(fluids).map(([key, value]) => [
        formatText(key),
        value
      ]);

      autoTable(doc, {
        startY: currentY + 3,
        head: [['Fluido', 'Estado']],
        body: fluidRows,
        theme: 'striped',
        headStyles: { fillColor: [41, 128, 185] },
        styles: { fontSize: 10 },
        margin: { left: 14, right: 14 }
      });

      currentY = (doc as any).lastAutoTable.finalY + 15;
    }

    // --- EQUIPO MÉDICO EN PDF ---
    const medicalEquipment = processMedicalEquipment(checklist.checklist_data?.medical_equipment);
    if (medicalEquipment.length > 0) {
      if (currentY > 250) { doc.addPage(); currentY = 20; }

      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.text("Monitor y Vitales", 14, currentY);

      const medicalRows = medicalEquipment.map(item => [item.name, item.status]);

      autoTable(doc, {
        startY: currentY + 3,
        head: [['Equipo Médico', 'Estado']],
        body: medicalRows,
        theme: 'grid',
        headStyles: { fillColor: [150, 150, 150] },
        styles: { fontSize: 10 },
        margin: { left: 14, right: 14 }
      });

      currentY = (doc as any).lastAutoTable.finalY + 10;
    }


    // Inventario (USANDO NORMALIZACIÓN)
    const inventory = checklist.checklist_data?.inventory_snapshot || {};
    Object.entries(inventory).forEach(([category, items]) => {
      if (items && items.length > 0) {
        if (currentY > 250) { doc.addPage(); currentY = 20; }

        doc.setFontSize(12);
        doc.setTextColor(0, 0, 0);
        doc.text(translateCategory(category), 14, currentY);

        // AQUÍ APLICAMOS LA NORMALIZACIÓN PARA EL PDF
        const itemRows = items.map((rawItem) => {
          const item = normalizeItem(rawItem);
          return [item.name, item.quantity.toString()];
        });

        autoTable(doc, {
          startY: currentY + 3,
          head: [['Material / Equipo', 'Cantidad']],
          body: itemRows,
          theme: 'grid',
          headStyles: { fillColor: [100, 100, 100] },
          styles: { fontSize: 10 },
          margin: { left: 14, right: 14 }
        });

        currentY = (doc as any).lastAutoTable.finalY + 10;
      }
    });

    if (checklist.checklist_data?.observations) {
      if (currentY > 250) doc.addPage();
      doc.setFontSize(12);
      doc.text("Observaciones:", 14, currentY + 5);
      doc.setFontSize(10);
      doc.text(checklist.checklist_data.observations, 14, currentY + 12);
    }

    doc.save(`reporte-${displayAmbulance}-${checklist.date}.pdf`);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto rounded-xl p-0 bg-slate-50">

        {/* Header (No modificado) */}
        <div className="p-6 bg-white border-b sticky top-0 z-10 flex justify-between items-start shadow-sm">
          <div>
            <DialogTitle className="text-2xl font-bold text-slate-900">
              Reporte de Inspección
            </DialogTitle>
            <DialogDescription className="text-slate-500 mt-1">
              Unidad {displayAmbulance} • {new Date(checklist?.created_at || "").toLocaleString("es-ES")}
            </DialogDescription>
          </div>
          <Button onClick={generatePDF} className="bg-red-600 hover:bg-red-700 text-white gap-2">
            <FileDown className="h-4 w-4" />
            Descargar PDF
          </Button>
        </div>

        {checklist && (
          <div className="p-6 space-y-6">

            {/* 1. Tarjeta Resumen Principal (No modificado) */}
            <Card className="border-none shadow-sm">
              <CardContent className="p-6 grid grid-cols-2 md:grid-cols-5 gap-4">

                <div className="bg-slate-100 p-3 rounded-lg flex flex-col justify-center">
                  <div className="flex items-center gap-2 mb-1">
                    <User className="w-4 h-4 text-blue-500" />
                    <span className="text-xs font-bold text-slate-500 uppercase">Responsable</span>
                  </div>
                  <div className="font-semibold text-slate-800 text-lg leading-tight flex items-center gap-2">
                    {responsibleName === "Buscando..." && <Loader2 className="h-4 w-4 animate-spin text-blue-500" />}
                    {responsibleName}
                  </div>
                </div>

                <div className="bg-slate-100 p-3 rounded-lg flex flex-col justify-center">
                  <div className="flex items-center gap-2 mb-1">
                    <Clock className="w-4 h-4 text-indigo-500" />
                    <span className="text-xs font-bold text-slate-500 uppercase">Turno</span>
                  </div>
                  <div className="font-semibold text-slate-800 text-lg">
                    {formatShift(checklist.shift)}
                  </div>
                </div>

                <div className="bg-slate-100 p-3 rounded-lg flex flex-col justify-center">
                  <div className="flex items-center gap-2 mb-1">
                    <Fuel className="w-4 h-4 text-orange-500" />
                    <span className="text-xs font-bold text-slate-500 uppercase">Combustible</span>
                  </div>
                  <div className="font-semibold text-slate-800 text-lg">{checklist.fuel}</div>
                </div>

                <div className="bg-slate-100 p-3 rounded-lg flex flex-col justify-center">
                  <div className="flex items-center gap-2 mb-1">
                    <Gauge className="w-4 h-4 text-purple-500" />
                    <span className="text-xs font-bold text-slate-500 uppercase">Millaje</span>
                  </div>
                  <div className="font-semibold text-slate-800 text-lg">{checklist.mileage}</div>
                </div>

                <div className="bg-slate-100 p-3 rounded-lg flex flex-col justify-center">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-slate-500 uppercase">Oxígeno (M/D)</span>
                  </div>
                  <div className="font-semibold text-slate-800 text-lg">{checklist.oxygen_m} / {checklist.oxygen_d}</div>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

              {/* 2. Columna Izquierda: Fluidos (No modificado) */}
              <div className="md:col-span-1 space-y-6">
                <Card className="border shadow-sm">
                  <CardHeader className="bg-blue-50/50 pb-3 border-b">
                    <CardTitle className="text-base flex items-center gap-2 text-blue-800">
                      <Droplets className="w-4 h-4" /> Niveles de Fluidos
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <table className="w-full text-sm">
                      <tbody>
                        {Object.entries(checklist.checklist_data?.fluids || {}).map(([key, value], index) => (
                          <tr key={key} className={index % 2 === 0 ? "bg-white" : "bg-slate-50"}>
                            <td className="p-3 font-medium text-slate-600 border-b capitalize">
                              {formatText(key)}
                            </td>
                            <td className="p-3 text-right font-bold border-b">
                              <span className={value === "Ok" ? "text-green-600" : "text-red-600"}>
                                {value}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </CardContent>
                </Card>

                {checklist.checklist_data?.observations && (
                  <Card className="border shadow-sm border-yellow-200 bg-yellow-50">
                    <CardContent className="p-4">
                      <span className="font-bold text-yellow-800 block mb-1">Observaciones:</span>
                      <p className="text-sm text-yellow-900">{checklist.checklist_data.observations}</p>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* 3. Columna Derecha: Inventario Detallado */}
              <div className="md:col-span-2">
                <Card className="border shadow-sm h-full">
                  <CardHeader className="bg-slate-50 pb-3 border-b">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Box className="w-4 h-4" /> Inventario y Equipos
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">

                    {/* --- NUEVA SECCIÓN: EQUIPO MÉDICO --- */}
                    {checklist.checklist_data?.medical_equipment && (
                      <div className="border-b">
                        <div className="bg-indigo-100 px-4 py-2 text-xs font-bold text-indigo-700 uppercase tracking-wider flex items-center gap-2">
                          <HeartPulse className="h-3 w-3" /> Monitor y Vitales
                        </div>
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm text-left">
                            <thead className="bg-white text-slate-500 border-b">
                              <tr>
                                <th className="px-4 py-2 font-medium w-3/4">Equipo</th>
                                <th className="px-4 py-2 font-medium text-right">Estado</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                              {processMedicalEquipment(checklist.checklist_data.medical_equipment).map((item, idx) => (
                                <tr key={idx} className="hover:bg-slate-50">
                                  <td className="px-4 py-2 text-slate-700">{item.name}</td>
                                  <td className="px-4 py-2 text-right font-mono font-medium">
                                    <span className={item.status.includes("Ok") ? "text-green-600" : "text-red-600"}>
                                      {item.status}
                                    </span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}


                    {/* --- SECCIÓN: INVENTORY SNAPSHOT (Resto del Inventario) --- */}
                    {checklist.checklist_data?.inventory_snapshot &&
                      Object.entries(checklist.checklist_data.inventory_snapshot).map(([category, items]) => {
                        if (!items || items.length === 0) return null;
                        return (
                          <div key={category} className="border-b last:border-0">
                            <div className="bg-slate-100 px-4 py-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
                              {translateCategory(category)}
                            </div>
                            <div className="overflow-x-auto">
                              <table className="w-full text-sm text-left">
                                <thead className="bg-white text-slate-500 border-b">
                                  <tr>
                                    <th className="px-4 py-2 font-medium w-3/4">Item</th>
                                    <th className="px-4 py-2 font-medium text-right">Cant.</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                  {items.map((rawItem, idx) => {
                                    const item = normalizeItem(rawItem);
                                    return (
                                      <tr key={idx} className="hover:bg-slate-50">
                                        <td className="px-4 py-2 text-slate-700">{item.name}</td>
                                        <td className="px-4 py-2 text-right font-mono font-medium text-slate-900">
                                          {item.quantity}
                                        </td>
                                      </tr>
                                    );
                                  })}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        );
                      })}
                  </CardContent>
                </Card>
              </div>
            </div>

          </div>
        )}

        <DialogFooter className="p-4 bg-white border-t">
          <Button variant="outline" onClick={onClose}>
            Cerrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ChecklistViewPopup;