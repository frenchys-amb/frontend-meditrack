import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Package, Pencil, Trash2, Pill } from "lucide-react";

interface Props {
  equipment: any[];
  medications: any[];
  onAdd: (type: 'equipment' | 'medication') => void;
  onEdit: (item: any, type: 'equipment' | 'medication') => void;
  onDelete: (id: string, type: 'equipment' | 'medication') => void;
}

export const InventoryTab = ({ equipment, medications, onAdd, onEdit, onDelete }: Props) => {
  return (
    <Card className="shadow-md border-slate-100 rounded-2xl overflow-hidden">
      <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 bg-white border-b border-slate-100">
        <CardTitle className="text-xl font-bold flex items-center gap-2 text-slate-800">
          <Package className="h-5 w-5 text-indigo-600" /> Existencias Actuales
        </CardTitle>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button className="flex-1 sm:flex-none bg-indigo-600 hover:bg-indigo-700 rounded-xl" onClick={() => onAdd('equipment')}>
            + Equipo
          </Button>
          <Button className="flex-1 sm:flex-none bg-emerald-600 hover:bg-emerald-700 rounded-xl" onClick={() => onAdd('medication')}>
            + Meds
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        {/* EQUIPOS */}
        <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">Equipos & Materiales</h3>
        <div className="rounded-xl border border-slate-200 overflow-hidden mb-8">
          <Table>
            <TableHeader className="bg-slate-800"><TableRow><TableHead className="text-white">Item</TableHead><TableHead className="text-white">Categoría</TableHead><TableHead className="text-white">Stock</TableHead><TableHead className="text-white text-right">Acción</TableHead></TableRow></TableHeader>
            <TableBody>
              {equipment.length === 0 && <TableRow><TableCell colSpan={4} className="text-center py-6 text-slate-400">Sin registros.</TableCell></TableRow>}
              {equipment.map((item) => (
                <TableRow key={item.id} className="group hover:bg-slate-50">
                  {/* 🟢 CORRECCIÓN 1: Mostrar el nombre original */}
                  <TableCell className="font-semibold capitalize">{item.original_name}</TableCell>
                  <TableCell><Badge variant="secondary">{item.category}</Badge></TableCell>
                  <TableCell className="text-center"><Badge className={item.quantity < 2 ? "bg-red-50 text-red-600" : "bg-emerald-50 text-emerald-600"}>{item.quantity} un.</Badge></TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => onEdit(item, 'equipment')}><Pencil className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" className="text-red-400" onClick={() => onDelete(item.id, 'equipment')}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* MEDICAMENTOS */}
        <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2"><Pill className="h-4 w-4" /> Medicamentos</h3>
        <div className="rounded-xl border border-slate-200 overflow-hidden">
          <Table>
            <TableHeader className="bg-slate-800"><TableRow><TableHead className="text-white">Medicamento</TableHead><TableHead className="text-white">Vencimiento</TableHead><TableHead className="text-white">Stock</TableHead><TableHead className="text-white text-right">Acción</TableHead></TableRow></TableHeader>
            <TableBody>
              {medications.length === 0 && <TableRow><TableCell colSpan={4} className="text-center py-6 text-slate-400">Sin registros.</TableCell></TableRow>}
              {medications.map((item) => (
                <TableRow key={item.id} className="group hover:bg-emerald-50/20">
                  {/* 🟢 CORRECCIÓN 2: Mostrar el nombre original */}
                  <TableCell className="font-semibold capitalize">{item.original_name}</TableCell>
                  <TableCell className="text-sm text-slate-600">{new Date(item.expiration_date).toLocaleDateString()}</TableCell>
                  <TableCell className="text-center"><Badge className={item.quantity < 5 ? "bg-red-50 text-red-600" : "bg-emerald-50 text-emerald-600"}>{item.quantity} un.</Badge></TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => onEdit(item, 'medication')}><Pencil className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" className="text-red-400" onClick={() => onDelete(item.id, 'medication')}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};