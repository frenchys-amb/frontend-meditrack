// este es de recomendacionespage
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Edit, Save, Loader2 } from 'lucide-react';
import { InventoryStandard } from '@/hooks/useInventoryStandards'; // Importamos el tipo del hook

interface Props {
  isOpen: boolean;
  onClose: () => void;
  item: InventoryStandard | null;
  onConfirm: (id: string, quantity: number) => Promise<void>;
}

export const EditStandardDialog = ({ isOpen, onClose, item, onConfirm }: Props) => {
  const [quantity, setQuantity] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (item) setQuantity(item.quantity.toString());
  }, [item]);

  const handleSave = async () => {
    if (!item) return;
    setIsSaving(true);
    await onConfirm(item.id, parseInt(quantity) || 0);
    setIsSaving(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[400px] rounded-2xl p-6 shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600">
               <Edit className="w-5 h-5" />
            </div>
            Editar Meta
          </DialogTitle>
          <DialogDescription className="pt-2">
            Ajusta la cantidad ideal por ambulancia.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-5 py-2">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-800 font-semibold text-sm text-center shadow-sm">
              {item?.normalized_name}
          </div>
          
          <div className="space-y-3">
            <Label htmlFor="qty" className="text-slate-600 font-medium text-xs uppercase tracking-wider">Nueva Cantidad Objetivo</Label>
            <Input 
              id="qty"
              type="number" 
              min="0"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="text-2xl font-bold text-center h-14 rounded-xl border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
        </div>

        <DialogFooter className="flex gap-2 sm:justify-between mt-4">
          <Button variant="ghost" onClick={onClose} className="rounded-xl text-slate-500 hover:text-slate-800">
            Cancelar
          </Button>
          <Button 
            onClick={handleSave} 
            className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-lg px-6 font-semibold"
            disabled={isSaving}
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
            Guardar Cambios
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};