import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useInventory } from '@/hooks/useInventory';
import { useToast } from "@/hooks/use-toast";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  item: { id: string; name: string; quantity: number } | null;
}

export const EditEquipmentModal: React.FC<Props> = ({ isOpen, onClose, item }) => {
  const { updateEquipment } = useInventory();
  const { toast } = useToast();
  const [quantity, setQuantity] = useState(0);

  useEffect(() => {
    if (item) setQuantity(item.quantity);
  }, [item]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!item) return;
    try {
      await updateEquipment(item.id, quantity);
      toast({ title: "Actualizado", description: "Stock modificado correctamente." });
      onClose();
    } catch (error: any) {
      toast({ title: "Error", description: "No se pudo actualizar.", variant: "destructive" });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Editar Stock</DialogTitle>
          <DialogDescription>Ajusta la cantidad disponible en almacén.</DialogDescription>
        </DialogHeader>
        {item && (
          <form onSubmit={handleUpdate} className="space-y-4 pt-4">
            <div>
              <Label className="text-xs text-slate-500">Equipo</Label>
              <div className="font-medium text-slate-800">{item.name}</div>
            </div>
            <div className="space-y-2">
              <Label>Nueva Cantidad</Label>
              <Input type="number" min="0" value={quantity} onChange={e => setQuantity(parseInt(e.target.value) || 0)} />
            </div>
            <DialogFooter>
              <Button variant="outline" type="button" onClick={onClose}>Cancelar</Button>
              <Button type="submit" className="bg-indigo-600">Actualizar</Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};