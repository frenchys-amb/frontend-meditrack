import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Trash2, Edit, Plus, Download, Search, AlertTriangle } from 'lucide-react';
import { useInventory } from '@/hooks/useInventory';
import { StorageMedication } from '@/types';
import { exportToCSV, exportToXLSX } from '@/lib/exportData';
import { isExpired, isNearExpiration, formatDate } from '@/lib/utils';

const StorageMedicationsComponent: React.FC = () => {
  const { medications, isLoading, addMedication, updateMedication, deleteMedication } = useInventory();
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedMedication, setSelectedMedication] = useState<StorageMedication | null>(null);
  const [formData, setFormData] = useState({ name: '', quantity: 0, expiration_date: '' });

  const filteredMedications = medications.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddMedication = async () => {
    if (!formData.name || formData.quantity <= 0 || !formData.expiration_date) return;
    await addMedication(formData.name, formData.quantity, formData.expiration_date);
    setFormData({ name: '', quantity: 0, expiration_date: '' });
    setIsAddDialogOpen(false);
  };

  const handleEditMedication = async () => {
    if (!selectedMedication || formData.quantity < 0) return;
    await updateMedication(selectedMedication.id, formData.quantity);
    setIsEditDialogOpen(false);
    setSelectedMedication(null);
    setFormData({ name: '', quantity: 0, expiration_date: '' });
  };

  const handleDeleteMedication = async (id: string) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este medicamento?')) {
      await deleteMedication(id);
    }
  };

  const openEditDialog = (item: StorageMedication) => {
    setSelectedMedication(item);
    setFormData({ name: item.name, quantity: item.quantity, expiration_date: item.expiration_date });
    setIsEditDialogOpen(true);
  };

  const handleExport = (format: 'csv' | 'xlsx') => {
    const dataToExport = filteredMedications.map(({ name, quantity, expiration_date, created_at }) => ({
      Nombre: name,
      Cantidad: quantity,
      'Fecha de Expiración': formatDate(expiration_date),
      'Fecha de Entrada': formatDate(created_at),
    }));

    if (format === 'csv') {
      exportToCSV(dataToExport, 'inventario_medicamentos.csv');
    } else {
      exportToXLSX(dataToExport, 'inventario_medicamentos.xlsx');
    }
  };
  
  const getRowClassName = (expirationDate: string) => {
    if (isExpired(expirationDate)) return 'bg-red-50';
    if (isNearExpiration(expirationDate)) return 'bg-yellow-50';
    return '';
  };

  if (isLoading) {
    return <div>Cargando...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Storage — Medicamentos</CardTitle>
        <CardDescription>Gestiona el inventario de medicamentos en el almacenamiento central.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-center mb-4">
          <div className="relative w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar medicamento..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex space-x-2">
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button><Plus className="h-4 w-4 mr-2" />Agregar Medicamento</Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Agregar Nuevo Medicamento</DialogTitle>
                  <DialogDescription>
                    Ingresa los detalles del nuevo medicamento.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="name" className="text-right">Nombre</Label>
                    <Input id="name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="col-span-3" />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="quantity" className="text-right">Cantidad</Label>
                    <Input id="quantity" type="number" value={formData.quantity} onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })} className="col-span-3" />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="expiration_date" className="text-right">Fecha de Expiración</Label>
                    <Input id="expiration_date" type="date" value={formData.expiration_date} onChange={(e) => setFormData({ ...formData, expiration_date: e.target.value })} className="col-span-3" />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" onClick={handleAddMedication}>Guardar</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            <Button variant="outline" onClick={() => handleExport('csv')}><Download className="h-4 w-4 mr-2" />CSV</Button>
            <Button variant="outline" onClick={() => handleExport('xlsx')}><Download className="h-4 w-4 mr-2" />XLSX</Button>
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Cantidad</TableHead>
              <TableHead>Fecha de Expiración</TableHead>
              <TableHead>Fecha de Entrada</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredMedications.map((item) => (
              <TableRow key={item.id} className={getRowClassName(item.expiration_date)}>
                <TableCell className="font-medium">{item.name}</TableCell>
                <TableCell>{item.quantity}</TableCell>
                <TableCell>
                  <div className="flex items-center">
                    {formatDate(item.expiration_date)}
                    {isExpired(item.expiration_date) && <AlertTriangle className="ml-2 h-4 w-4 text-red-500" />}
                    {isNearExpiration(item.expiration_date) && <AlertTriangle className="ml-2 h-4 w-4 text-yellow-500" />}
                  </div>
                </TableCell>
                <TableCell>{formatDate(item.created_at)}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm" onClick={() => openEditDialog(item)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDeleteMedication(item.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Editar Medicamento</DialogTitle>
              <DialogDescription>
                Actualiza la cantidad del medicamento.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-name" className="text-right">Nombre</Label>
                <Input id="edit-name" value={formData.name} disabled className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-quantity" className="text-right">Cantidad</Label>
                <Input id="edit-quantity" type="number" value={formData.quantity} onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })} className="col-span-3" />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" onClick={handleEditMedication}>Actualizar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default StorageMedicationsComponent;