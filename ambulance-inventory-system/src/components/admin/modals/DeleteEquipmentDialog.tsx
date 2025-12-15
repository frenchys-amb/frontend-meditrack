import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';
import { useInventory } from '@/hooks/useInventory';
import { useToast } from "@/hooks/use-toast";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  item: { id: string; name: string } | null;
}

export const DeleteEquipmentDialog: React.FC<Props> = ({ isOpen, onClose, item }) => {
  const { deleteEquipment } = useInventory();
  const { toast } = useToast();

  const handleConfirm = async () => {
    if (!item) return;
    try {
      await deleteEquipment(item.id);
      toast({ title: "Eliminado", description: "Equipo borrado correctamente." });
      onClose();
    } catch (error) {
      toast({ title: "Error", description: "No se pudo eliminar.", variant: "destructive" });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" /> Eliminar Equipo
          </DialogTitle>
          <DialogDescription className="pt-2">
            ¿Estás seguro de eliminar <b>{item?.name}</b>? Esta acción no se puede deshacer.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:justify-center mt-4">
          <Button variant="outline" onClick={onClose} className="w-full">Cancelar</Button>
          <Button variant="destructive" onClick={handleConfirm} className="w-full bg-red-600 hover:bg-red-700">Eliminar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};