import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Calendar } from 'lucide-react'; // Añadido icono de calendario

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: { name: string; quantity: number; expiration_date: string | null; recommended_quantity: number }) => Promise<void>;
}

export const AddMedicationModal = ({ isOpen, onClose, onSave }: Props) => {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    quantity: 0,
    expiration_date: '',
    recommended_quantity: 0
  });

  const handleSubmit = async () => {
    // ELIMINADA LA VALIDACIÓN DE !formData.expiration_date
    if (!formData.name || formData.quantity <= 0) {
      alert("El nombre y la cantidad son obligatorios");
      return;
    }

    setIsLoading(true);

    // Convertimos string vacío a null para Supabase
    const dataToSave = {
      ...formData,
      expiration_date: formData.expiration_date === '' ? null : formData.expiration_date
    };

    await onSave(dataToSave as any);

    setIsLoading(false);
    setFormData({ name: '', quantity: 0, expiration_date: '', recommended_quantity: 0 });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] rounded-2xl p-6">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-slate-900">Nuevo Ingreso</DialogTitle>
          <DialogDescription>Registra el medicamento. La fecha de vencimiento es opcional.</DialogDescription>
        </DialogHeader>

        <div className="grid gap-5 py-4">
          {/* Nombre */}
          <div className="space-y-2">
            <Label>Nombre del Medicamento *</Label>
            <Input
              placeholder="Ej: Ketorolaco 30mg"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Stock */}
            <div className="space-y-2">
              <Label>Stock Inicial *</Label>
              <Input
                type="number"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })}
              />
            </div>

            {/* Meta */}
            <div className="space-y-2">
              <Label>Meta Ideal</Label>
              <Input
                type="number"
                value={formData.recommended_quantity}
                onChange={(e) => setFormData({ ...formData, recommended_quantity: parseInt(e.target.value) || 0 })}
                className="bg-purple-50/50 border-purple-200"
              />
            </div>
          </div>

          {/* Fecha de Expiración - AHORA VISIBLE Y OPCIONAL */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-slate-400" />
              Fecha de Vencimiento (Opcional)
            </Label>
            <Input
              type="date"
              value={formData.expiration_date}
              onChange={(e) => setFormData({ ...formData, expiration_date: e.target.value })}
              className="w-full"
            />
            <p className="text-[10px] text-slate-400 italic">Dejar vacío si no aplica.</p>
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