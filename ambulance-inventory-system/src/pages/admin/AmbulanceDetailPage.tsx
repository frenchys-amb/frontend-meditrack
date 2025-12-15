import { useState } from "react";
import { useParams } from "react-router-dom";

// UI Components
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";

// Icons
import { Package, ClipboardList, FileText, TrendingDown, Trash2, X, Eye } from "lucide-react";

// Logic & Hooks
import { supabase } from "@/integrations/supabase/client";
import { useAmbulanceDetail } from "@/hooks/useAmbulanceDetail"; // Importamos nuestro nuevo hook

// Sub-Components
import { InventoryTab } from "@/components/ambulance/tabs/InventoryTab";
import { HistoryTab } from "@/components/ambulance/tabs/HistoryTab";
import { RequisitionsTab } from "@/components/ambulance/tabs/RequisitionsTab";// Asumiendo que creas este
import { UsageTab } from "@/components/ambulance/tabs/UsageTab"; // Asumiendo que creas este

// Popups
import EquipmentPopup from "@/components/ambulance/EquipmentPopup";
import MedicationPopup from "@/components/ambulance/MedicationPopup";
import ChecklistViewPopup from "@/components/ambulance/ChecklistViewPopup";
import RequisitionViewPopup from "@/components/ambulance/RequisitionViewPopup";
import UsageViewPopup from "@/components/ambulance/UsageViewPopup";

const AmbulanceDetailPage = () => {
  const { unitId } = useParams<{ unitId: string }>();

  // 1. Usar el Hook Refactorizado
  const {
    currentAmbulance,
    ambulanceUUID,
    equipment,
    medications,
    checklists,
    requisitions,
    usageLogs,
    isLoading,
    refresh
  } = useAmbulanceDetail(unitId);

  // 2. Estados de UI
  const [searchTerm, setSearchTerm] = useState("");
  const [equipmentDialogOpen, setEquipmentDialogOpen] = useState(false);
  const [medDialogOpen, setMedDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any | null>(null);

  // Estados de visualización de detalles
  const [selectedChecklist, setSelectedChecklist] = useState<any | null>(null);
  const [selectedRequisition, setSelectedRequisition] = useState<any | null>(null);
  const [selectedGasto, setSelectedGasto] = useState<any | null>(null);

  // Estados de Confirmación
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ id: string; type: 'equipment' | 'medication' } | null>(null);

  // 3. Lógica de Filtrado (Centralizada para el buscador global)
  const lowerSearch = searchTerm.toLowerCase();

  const filteredEquipment = equipment.filter(item =>
    item.normalized_name.toLowerCase().includes(lowerSearch) || item.category.toLowerCase().includes(lowerSearch));
  const filteredMedications = medications.filter(item =>
    item.normalized_name.toLowerCase().includes(lowerSearch));
  const filteredChecklists = checklists.filter(item =>
    new Date(item.created_at || item.date).toLocaleDateString().includes(lowerSearch));
  const filteredRequisitions = requisitions.filter(item =>
    new Date(item.created_at || item.date).toLocaleDateString().includes(lowerSearch));
  const filteredUsage = usageLogs.filter(item =>
    new Date(item.created_at || item.date).toLocaleDateString().includes(lowerSearch));

  // 4. Handlers
  const handleOpenModal = (type: 'equipment' | 'medication', item: any = null) => {
    setEditingItem(item);
    if (type === 'equipment') setEquipmentDialogOpen(true);
    else setMedDialogOpen(true);
  };

  const handleDeleteRequest = (id: string, type: 'equipment' | 'medication') => {
    setItemToDelete({ id, type });
    setIsDeleteConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;
    try {
      const tableName = itemToDelete.type === 'equipment' ? 'ambulance_equipment' : 'ambulance_medications';
      await supabase.from(tableName).delete().eq('id', itemToDelete.id);
      refresh();
    } catch (error) { console.error("Error al eliminar", error); }
    finally { setIsDeleteConfirmOpen(false); setItemToDelete(null); }
  };

  if (isLoading) return <div className="flex h-screen items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-4 border-indigo-600"></div></div>;
  if (!currentAmbulance) return <div className="p-8 text-center">Unidad no encontrada <Button onClick={() => window.history.back()}>Volver</Button></div>;

  return (
    <div className="flex flex-col w-full min-h-screen bg-slate-50/50 pb-10">
      <main className="container mx-auto px-4 py-6 space-y-6 max-w-7xl">

        {/* HEADER */}
        <Card className="shadow-lg border-0 ring-1 ring-slate-200 rounded-2xl bg-white overflow-hidden">
          <div className="h-2 bg-indigo-600 w-full"></div>
          <CardHeader className="p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-start gap-4">
                <div className="h-16 w-16 bg-indigo-50 rounded-2xl flex items-center justify-center shadow-inner shrink-0">
                  <span className="text-3xl">🚑</span>
                </div>
                <div>
                  <CardTitle className="text-3xl font-extrabold text-slate-800 tracking-tight">Unidad {unitId}</CardTitle>
                  <p className="text-slate-500 font-medium mt-1">Gestión de inventario y control operativo</p>
                </div>
              </div>
              <div className="relative w-full md:w-80 group">
                <Input placeholder="Buscar..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pr-10" />
                {searchTerm ?
                  <button onClick={() => setSearchTerm('')} className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400"><X className="h-5 w-5" /></button> :
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400"><Eye className="h-5 w-5 opacity-50" /></div>
                }
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* TABS CONTAINER */}
        <Tabs defaultValue="equipment" className="w-full">
          <div className="overflow-x-auto pb-2 scrollbar-hide">
            <TabsList className="bg-white p-1 shadow-sm border border-slate-200 rounded-xl inline-flex w-full md:w-auto min-w-max">
              <TabsTrigger value="equipment" className="px-6 py-2.5 rounded-lg data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700 font-semibold gap-2"><Package className="h-4 w-4" /> Inventario</TabsTrigger>
              <TabsTrigger value="checklists" className="px-6 py-2.5 rounded-lg data-[state=active]:bg-green-50 data-[state=active]:text-green-700 font-semibold gap-2"><ClipboardList className="h-4 w-4" /> Checklists</TabsTrigger>
              <TabsTrigger value="requisitions" className="px-6 py-2.5 rounded-lg data-[state=active]:bg-purple-50 data-[state=active]:text-purple-700 font-semibold gap-2"><FileText className="h-4 w-4" /> Requisiciones</TabsTrigger>
              <TabsTrigger value="gastos" className="px-6 py-2.5 rounded-lg data-[state=active]:bg-orange-50 data-[state=active]:text-orange-700 font-semibold gap-2"><TrendingDown className="h-4 w-4" /> Gastos</TabsTrigger>
            </TabsList>
          </div>

          {/* TAB CONTENT: INJECTING SUB-COMPONENTS */}
          <TabsContent value="equipment" className="mt-4 animate-in fade-in-50">
            <InventoryTab
              equipment={filteredEquipment}
              medications={filteredMedications}
              onAdd={(type) => handleOpenModal(type)}
              onEdit={(item, type) => handleOpenModal(type, item)}
              onDelete={handleDeleteRequest}
            />
          </TabsContent>

          <TabsContent value="checklists" className="mt-4 animate-in fade-in-50">
            <HistoryTab checklists={filteredChecklists} onView={setSelectedChecklist} />
          </TabsContent>

          <TabsContent value="requisitions" className="mt-4 animate-in fade-in-50">
            {/* Componente RequisitionsTab simplificado o importado */}
            <RequisitionsTab requisitions={filteredRequisitions} onView={setSelectedRequisition} />
          </TabsContent>

          <TabsContent value="gastos" className="mt-4 animate-in fade-in-50">
            {/* Componente UsageTab simplificado o importado */}
            <UsageTab usageLogs={filteredUsage} onView={setSelectedGasto} />
          </TabsContent>
        </Tabs>
      </main>

      {/* GLOBAL MODALS */}
      <EquipmentPopup open={equipmentDialogOpen} onOpenChange={setEquipmentDialogOpen} ambulanceId={ambulanceUUID || ""} onAdded={refresh} initialData={editingItem} />
      <MedicationPopup open={medDialogOpen} onOpenChange={setMedDialogOpen} ambulanceId={ambulanceUUID || ""} onAdded={refresh} initialData={editingItem} />

      <ChecklistViewPopup open={!!selectedChecklist} checklist={selectedChecklist} unitId={unitId} onClose={() => setSelectedChecklist(null)} />
      <RequisitionViewPopup open={!!selectedRequisition} requisition={selectedRequisition} unitId={unitId} onClose={() => setSelectedRequisition(null)} />
      <UsageViewPopup open={!!selectedGasto} usageLog={selectedGasto} unitId={unitId} onClose={() => setSelectedGasto(null)} />

      {/* DELETE CONFIRMATION */}
      <Dialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
        <DialogContent className="sm:max-w-[425px] rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-red-600 flex items-center gap-2"><Trash2 className="h-5 w-5" /> Retirar Item</DialogTitle>
            <DialogDescription>¿Confirmas retirar este ítem de la <strong>Unidad {unitId}</strong>?</DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setIsDeleteConfirmOpen(false)}>Cancelar</Button>
            <Button onClick={confirmDelete} className="bg-red-600 hover:bg-red-700 text-white">Sí, Retirar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AmbulanceDetailPage;