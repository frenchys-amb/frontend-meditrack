import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Trash2, Edit, Plus, Pill, FileText, Loader2, Search } from 'lucide-react';
import { useInventory } from '@/hooks/useInventory';
import { StorageMedication } from '@/types';
import { isExpired, isNearExpiration, formatDate } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';

// Importaciones de archivos refactorizados
import { STATUS_CONFIG } from '@/config/medicationConfig';
import { printMedicationReport } from '@/utils/printHelpers';
import { AddMedicationModal } from '@/components/admin/modals/AddMedicationModal';

const StorageMedications: React.FC = () => {
  const { medications, isLoading, addMedication, updateMedication, deleteMedication } = useInventory();

  // Estados UI
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);

  // Estados Datos
  const [selectedMedication, setSelectedMedication] = useState<StorageMedication | null>(null);
  const [editQuantity, setEditQuantity] = useState(0);

  const filteredMedications = medications.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // --- HANDLERS (Lógica de Negocio) ---

  const handleAddWrapper = async (data: { name: string; quantity: number; expiration_date: string; recommended_quantity: number }) => {
    try {
      await addMedication(data.name, data.quantity, data.expiration_date);

      // Lógica específica: Si hay cantidad recomendada, actualizar standards
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
    } catch (error) {
      console.error("Error al agregar medicamento:", error);
    }
  };

  const handleEditConfirm = async () => {
    if (!selectedMedication || editQuantity < 0) return;
    setIsActionLoading(true);
    try {
      await updateMedication(selectedMedication.id, editQuantity);
      setIsEditDialogOpen(false);
      setSelectedMedication(null);
    } catch (error) {
      console.error("Error al actualizar:", error);
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('🚨 ¿Estás seguro de que deseas eliminar este medicamento?')) {
      await deleteMedication(id);
    }
  };

  const openEditDialog = (item: StorageMedication) => {
    setSelectedMedication(item);
    setEditQuantity(item.quantity);
    setIsEditDialogOpen(true);
  };

  // Helper UI local
  const getRowClassName = (expirationDate: string) => {
    if (isExpired(expirationDate)) return 'bg-red-50/50 hover:bg-red-50 transition-colors';
    if (isNearExpiration(expirationDate)) return 'bg-amber-50/50 hover:bg-amber-50 transition-colors';
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
      <CardHeader className="bg-slate-50">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex items-center gap-5">
            <div className="h-14 w-14 bg-gradient-to-br from-slate-800 to-slate-700 rounded-2xl flex items-center justify-center shadow-lg text-white">
              <Pill className="h-7 w-7" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-black tracking-tight">Farmacia Central</h1>
              <p className="text-black mt-1 font-medium">Control maestro de inventario</p>
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => printMedicationReport(filteredMedications)}
              className="border-slate-200 text-slate-600 hover:bg-slate-50 h-10 px-4 rounded-xl font-semibold text-sm"
            >
              <FileText className="h-4 w-4 mr-2" /> Exportar
            </Button>

            <Button
              onClick={() => setIsAddDialogOpen(true)}
              className="bg-slate-900 hover:bg-slate-800 text-white shadow-lg shadow-slate-900/20 h-10 px-6 rounded-xl font-semibold text-sm transition-all hover:scale-105"
            >
              <Plus className="h-4 w-4 mr-2" /> Registrar Nuevo
            </Button>
          </div>
        </div>

        {/* SEARCH BAR */}
        <div className="mt-8 relative max-w-md">
          <Input
            placeholder="Buscar por nombre, código o lote..."
            className="pl-4 h-10 bg-slate-50 border-slate-200 focus:bg-white focus:border-slate-400 focus:ring-0 transition-all rounded-xl font-medium text-slate-700 placeholder:text-slate-400"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search className="absolute right-3 top-2.5 h-5 w-5 text-slate-400" />
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader style={{ background: 'linear-gradient(135deg, #2d3748 0%, #1a202c 50%, #4a5568 100%)' }}>
              <TableRow className="hover:bg-transparent border-none">
                <TableHead className="text-white font-medium h-12 rounded-tl-none first:pl-8">Medicamento</TableHead>
                <TableHead className="text-white font-medium h-12">Stock Almacén</TableHead>
                <TableHead className="text-white font-medium h-12">Vencimiento</TableHead>
                <TableHead className="text-white font-medium h-12 hidden md:table-cell">Ingreso</TableHead>
                <TableHead className="text-white font-medium h-12 text-right pr-8 rounded-tr-none">Acciones</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {filteredMedications.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-48 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center opacity-60">
                      <Search className="h-10 w-10 mb-3 text-slate-300" />
                      <p>No se encontraron resultados.</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredMedications.map((item) => {
                  const status = getStatus(item.expiration_date);
                  return (
                    <TableRow key={item.id} className={`${getRowClassName(item.expiration_date)} border-b border-slate-100 last:border-0`}>
                      <TableCell className="font-semibold text-slate-800 first:pl-8 py-4">
                        {item.name}
                      </TableCell>

                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className={`h-2 w-2 rounded-full ${item.quantity < 10 ? 'bg-red-500 animate-pulse' : 'bg-emerald-500'}`}></div>
                          <span className="font-mono font-medium text-slate-700">{item.quantity}</span>
                          <span className="text-xs text-slate-400">unids.</span>
                        </div>
                      </TableCell>

                      <TableCell>
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs border ${status.class}`}>
                          {status.icon}
                          {item.expiration_date ? formatDate(item.expiration_date) : 'N/A'}
                        </span>
                      </TableCell>

                      <TableCell className="hidden md:table-cell text-slate-400 text-sm font-medium">
                        {formatDate(item.created_at)}
                      </TableCell>

                      <TableCell className="text-right pr-8">
                        <div className="flex justify-end gap-1 opacity-80 hover:opacity-100 transition-opacity">
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg" onClick={() => openEditDialog(item)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg" onClick={() => handleDelete(item.id)}>
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

      {/* Modales */}
      <AddMedicationModal
        isOpen={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        onSave={handleAddWrapper}
      />

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[400px] rounded-2xl p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-900">Ajuste Rápido de Stock</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wide text-slate-500 font-semibold">Producto</Label>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 text-slate-700 font-medium text-sm">
                {selectedMedication?.name}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Cantidad Actual</Label>
              <Input
                type="number" min="0"
                value={editQuantity}
                onChange={(e) => setEditQuantity(parseInt(e.target.value) || 0)}
                className="rounded-lg border-slate-300"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsEditDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleEditConfirm} className="bg-slate-900 text-white rounded-lg" disabled={isActionLoading}>
              {isActionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Confirmar Ajuste'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </Card>
  );
};

export default StorageMedications;