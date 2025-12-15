// este va con storagemedicationpage
import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: { name: string; quantity: number; expiration_date: string; recommended_quantity: number }) => Promise<void>;
}

export const AddMedicationModal = ({ isOpen, onClose, onSave }: Props) => {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '', quantity: 0, expiration_date: '', recommended_quantity: 0
  });

  const handleSubmit = async () => {
    if (!formData.name || formData.quantity <= 0 || !formData.expiration_date) {
      alert("Completa los campos obligatorios");
      return;
    }
    setIsLoading(true);
    await onSave(formData);
    setIsLoading(false);
    setFormData({ name: '', quantity: 0, expiration_date: '', recommended_quantity: 0 }); // Reset
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] rounded-2xl p-6">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-slate-900">Nuevo Ingreso</DialogTitle>
          <DialogDescription>Registra el medicamento en el sistema central.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-5 py-4">
          <div className="space-y-2">
            <Label>Nombre del Medicamento</Label>
            <Input
              placeholder="Ej: Ketorolaco 30mg"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Stock Inicial</Label>
              <Input
                type="number"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })}
              />
            </div>
            <div className="space-y-2">
              <Label>Meta Ideal (Ambulancia)</Label>
              <Input
                type="number"
                value={formData.recommended_quantity}
                onChange={(e) => setFormData({ ...formData, recommended_quantity: parseInt(e.target.value) || 0 })}
                className="bg-purple-50/50 border-purple-200"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Vencimiento</Label>
            <Input
              type="date"
              value={formData.expiration_date}
              onChange={(e) => setFormData({ ...formData, expiration_date: e.target.value })}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button onClick={handleSubmit} className="bg-slate-900 text-white" disabled={isLoading}>
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Guardar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};