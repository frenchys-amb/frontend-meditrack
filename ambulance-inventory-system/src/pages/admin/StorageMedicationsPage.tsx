import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Trash2, Edit, Plus, Pill, FileText, Loader2, Search } from 'lucide-react';

// Hooks y Utilidades
import { useInventory } from '@/hooks/useInventory';
import { StorageMedication } from '@/types';
import { isExpired, isNearExpiration, formatDate } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';

// Configuración y Componentes Refactorizados
import { STATUS_CONFIG } from '@/config/medicationConfig';
import { printMedicationReport } from '@/utils/printHelpers';
import { AddMedicationModal } from '@/components/admin/modals/AddMedicationModal';
import { DeleteMedicationDialog } from '@/components/admin/modals/DeleteMedicationDialog';

const StorageMedications: React.FC = () => {
  const { medications, isLoading, addMedication, updateMedication, deleteMedication } = useInventory();

  // --- ESTADOS DE UI ---
  const [searchTerm, setSearchTerm] = useState('');
  const [activeModal, setActiveModal] = useState<'add' | 'edit' | 'delete' | null>(null);
  const [isActionLoading, setIsActionLoading] = useState(false);

  // --- ESTADOS DE DATOS ---
  const [selectedMedication, setSelectedMedication] = useState<StorageMedication | null>(null);
  const [editQuantity, setEditQuantity] = useState(0);

  // --- LÓGICA DE FILTRADO ---
  const filteredMedications = useMemo(() =>
    medications.filter(item =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase())
    ), [medications, searchTerm]
  );

  // --- HANDLERS (Lógica de Negocio) ---

  const handleAddWrapper = async (data: { name: string; quantity: number; expiration_date: string | null; recommended_quantity: number }) => {
    setIsActionLoading(true);
    try {
      await addMedication(data.name, data.quantity, data.expiration_date);

      // Si hay cantidad recomendada, actualizamos los estándares en la DB
      if (data.recommended_quantity > 0) {
        const normalizedName = data.name.trim().toLowerCase();
        await supabase
          .from('inventory_standards')
          .upsert({
            normalized_name: normalizedName,
            category: 'medicamentos',
            quantity: data.recommended_quantity
          }, { onConflict: 'normalized_name, category' });
      }
      setActiveModal(null);
    } catch (error) {
      console.error("Error al agregar:", error);
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleEditConfirm = async () => {
    if (!selectedMedication || editQuantity < 0) return;
    setIsActionLoading(true);
    try {
      await updateMedication(selectedMedication.id, editQuantity);
      setActiveModal(null);
      setSelectedMedication(null);
    } catch (error) {
      console.error("Error al actualizar:", error);
    } finally {
      setIsActionLoading(false);
    }
  };

  // --- HELPERS VISUALES ---
  const getRowClassName = (expirationDate: string) => {
    if (isExpired(expirationDate)) return 'bg-red-50/50 hover:bg-red-100/50 transition-colors';
    if (isNearExpiration(expirationDate)) return 'bg-amber-50/50 hover:bg-amber-100/50 transition-colors';
    return 'hover:bg-slate-50 transition-colors';
  };

  const getStatus = (expirationDate: string) => {
    if (isExpired(expirationDate)) return STATUS_CONFIG.EXPIRED;
    if (isNearExpiration(expirationDate)) return STATUS_CONFIG.NEAR;
    return STATUS_CONFIG.GOOD;
  };

  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center h-96 bg-white rounded-2xl shadow-sm border border-slate-100">
        <Loader2 className="h-12 w-12 text-slate-800 animate-spin mb-4" />
        <p className="text-slate-500 font-medium">Sincronizando inventario...</p>
      </div>
    );
  }

  return (
    <Card className="border-none shadow-2xl bg-white rounded-2xl overflow-hidden">

      {/* HEADER */}
      <CardHeader className="bg-slate-50 border-b border-slate-100">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex items-center gap-5">
            <div className="h-14 w-14 bg-slate-900 rounded-2xl flex items-center justify-center shadow-lg text-white">
              <Pill className="h-7 w-7" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Farmacia Central</h1>
              <p className="text-slate-500 mt-1 font-medium">Control maestro de inventario</p>
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => printMedicationReport(filteredMedications)}
              className="border-slate-200 text-slate-600 hover:bg-slate-100 rounded-xl font-semibold"
            >
              <FileText className="h-4 w-4 mr-2" /> Exportar
            </Button>

            <Button
              onClick={() => setActiveModal('add')}
              className="bg-slate-900 hover:bg-black text-white shadow-lg h-10 px-6 rounded-xl font-semibold transition-all hover:scale-105"
            >
              <Plus className="h-4 w-4 mr-2" /> Registrar Nuevo
            </Button>
          </div>
        </div>

        {/* SEARCH BAR */}
        <div className="mt-8 relative max-w-md">
          <Input
            placeholder="Buscar por nombre..."
            className="pl-4 pr-10 h-11 bg-white border-slate-200 focus:ring-2 focus:ring-slate-900/5 transition-all rounded-xl font-medium"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search className="absolute right-3 top-3 h-5 w-5 text-slate-400" />
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-900">
              <TableRow className="hover:bg-transparent border-none">
                <TableHead className="text-white font-semibold h-12 first:pl-8">Medicamento</TableHead>
                <TableHead className="text-white font-semibold h-12">Stock Almacén</TableHead>
                <TableHead className="text-white font-semibold h-12">Vencimiento</TableHead>
                <TableHead className="text-white font-semibold h-12 hidden md:table-cell">Ingreso</TableHead>
                <TableHead className="text-white font-semibold h-12 text-right pr-8">Acciones</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {filteredMedications.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-48 text-center text-slate-400">
                    <Search className="h-10 w-10 mb-3 mx-auto opacity-20" />
                    <p>No se encontraron medicamentos en el inventario.</p>
                  </TableCell>
                </TableRow>
              ) : (
                filteredMedications.map((item) => {
                  const status = getStatus(item.expiration_date);
                  return (
                    <TableRow key={item.id} className={`${getRowClassName(item.expiration_date)} border-b border-slate-100 last:border-0`}>
                      <TableCell className="font-bold text-slate-900 first:pl-8 py-4">
                        {item.name}
                      </TableCell>

                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className={`h-2.5 w-2.5 rounded-full ${item.quantity < 10 ? 'bg-red-500 animate-pulse' : 'bg-emerald-500'}`} />
                          <span className="font-mono font-bold text-slate-800 text-lg">{item.quantity}</span>
                          <span className="text-xs text-slate-400 font-medium">UDS.</span>
                        </div>
                      </TableCell>

                      <TableCell>
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold border ${status.class}`}>
                          {status.icon}
                          {item.expiration_date ? formatDate(item.expiration_date) : 'N/A'}
                        </span>
                      </TableCell>

                      <TableCell className="hidden md:table-cell text-slate-500 text-sm font-medium">
                        {formatDate(item.created_at)}
                      </TableCell>

                      <TableCell className="text-right pr-8">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9 text-slate-400 hover:text-blue-600 hover:bg-blue-50"
                            onClick={() => {
                              setSelectedMedication(item);
                              setEditQuantity(item.quantity);
                              setActiveModal('edit');
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9 text-slate-400 hover:text-red-600 hover:bg-red-50"
                            onClick={() => {
                              setSelectedMedication(item);
                              setActiveModal('delete');
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>

      {/* --- MODALES --- */}

      <AddMedicationModal
        isOpen={activeModal === 'add'}
        onClose={() => setActiveModal(null)}
        onSave={handleAddWrapper}
      />

      <DeleteMedicationDialog
        isOpen={activeModal === 'delete'}
        onClose={() => setActiveModal(null)}
        item={selectedMedication ? { id: selectedMedication.id, name: selectedMedication.name } : null}
        onConfirm={deleteMedication}
      />

      <Dialog open={activeModal === 'edit'} onOpenChange={(open) => !open && setActiveModal(null)}>
        <DialogContent className="sm:max-w-[400px] rounded-2xl p-6">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-slate-900">Ajuste de Stock</DialogTitle>
          </DialogHeader>
          <div className="grid gap-5 py-4">
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-widest text-slate-400 font-bold">Medicamento</Label>
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 text-slate-900 font-bold text-base">
                {selectedMedication?.name}
              </div>
            </div>
            <div className="space-y-2">
              <Label className="font-semibold text-slate-700">Cantidad en Existencia</Label>
              <Input
                type="number"
                min="0"
                value={editQuantity}
                onChange={(e) => setEditQuantity(parseInt(e.target.value) || 0)}
                className="rounded-xl h-12 border-slate-200 focus:border-slate-900 text-lg font-mono"
              />
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="ghost" onClick={() => setActiveModal(null)} className="rounded-xl font-semibold">
              Cancelar
            </Button>
            <Button
              onClick={handleEditConfirm}
              className="bg-slate-900 text-white rounded-xl px-8 font-semibold"
              disabled={isActionLoading}
            >
              {isActionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Actualizar Inventario'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </Card>
  );
};

export default StorageMedications;