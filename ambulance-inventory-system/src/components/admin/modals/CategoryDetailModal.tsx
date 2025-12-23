import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Archive, Edit, Trash2, ArrowRightLeft } from 'lucide-react';

interface Equipment {
  id: string;
  name: string;
  quantity: number;
  created_at: string;
  [key: string]: any;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  categoryLabel: string;
  categoryIcon?: React.ReactNode;
  categoryColorClass?: string;
  items: Equipment[];
  onEdit: (item: Equipment) => void;
  onDelete: (item: Equipment) => void;
  onMove: (item: any) => void;
}

export const CategoryDetailModal: React.FC<Props> = ({
  isOpen, onClose, categoryLabel, categoryIcon, categoryColorClass, items, onEdit, onDelete, onMove,
}) => {
  const [localSearch, setLocalSearch] = useState('');

  const filteredItems = items.filter(i => i.name.toLowerCase().includes(localSearch.toLowerCase()));

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[80vh] flex flex-col p-0 gap-0 overflow-hidden rounded-2xl">
        <DialogHeader className="p-6 bg-slate-50 border-b border-slate-100 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${categoryColorClass || 'bg-slate-100'}`}>
                {categoryIcon}
              </div>
              <div>
                <DialogTitle className="text-2xl font-bold text-slate-900">{categoryLabel}</DialogTitle>
                <DialogDescription>Gestionando inventario de esta categoría.</DialogDescription>
              </div>
            </div>
          </div>
          <div className="mt-4 relative">
            <Input
              placeholder="Buscar en esta categoría..."
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              className="pl-9 bg-white border-slate-200"
            />
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-auto bg-white p-0">
          <Table>
            <TableHeader
              style={{
                background: 'linear-gradient(135deg, #2d3748 0%, #1a202c 50%, #4a5568 100%)'
              }}
            >
              <TableRow>
                <TableHead className="pl-6 text-white">Equipo</TableHead>
                <TableHead className="text-white">Stock Almacén</TableHead>
                <TableHead className="hidden md:table-cell text-white">Ingreso</TableHead>
                <TableHead className="text-white text-xs font-bold uppercase mr-4">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-40 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center">
                      <Archive className="h-10 w-10 mb-2 opacity-20" />
                      <p>No hay equipos registrados.</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredItems.map((item) => (
                  <TableRow key={item.id} className="hover:bg-slate-50">
                    <TableCell className="font-medium pl-6 text-slate-700">{item.name}</TableCell>
                    <TableCell>
                      <Badge className={`shadow-none ${item.quantity === 0 ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}`}>
                        {item.quantity} unids.
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-slate-500 text-sm">
                      {new Date(item.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right pr-6">
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" onClick={() => onEdit(item)}>
                          <Edit className="h-4 w-4 text-slate-500" />
                        </Button>

                        <Button variant="ghost" size="icon" onClick={() => onMove(item)}>
                          <ArrowRightLeft className="h-4 w-4 text-blue-500" />
                        </Button>

                        <Button variant="ghost" size="icon" onClick={() => onDelete(item)}>
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </DialogContent>
    </Dialog>
  );
};