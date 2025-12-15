import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Target } from 'lucide-react';
import { useInventory } from '@/hooks/useInventory';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  categories: { value: string; label: string }[];
  onSuccess: () => void;
}

export const AddEquipmentModal: React.FC<Props> = ({ isOpen, onClose, categories, onSuccess }) => {
  const { toast } = useToast();
  const { addEquipment } = useInventory();

  const [formData, setFormData] = useState({
    name: '',
    quantity: 0,
    category: '',
    recommended_quantity: 0
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.category) {
      toast({ title: "Faltan datos", description: "Completa los campos obligatorios.", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    try {
      const cleanName = formData.name.trim();
      const normalizedName = cleanName.toLowerCase();

      // 1. Guardar en Storage
      await addEquipment(cleanName, formData.quantity, formData.category);

      // 2. Guardar Meta en Estándares
      if (formData.recommended_quantity > 0) {
        const { error: stdError } = await supabase.from('inventory_standards').upsert({
          normalized_name: normalizedName,
          category: formData.category,
          quantity: formData.recommended_quantity
        }, { onConflict: 'normalized_name, category' });

        if (stdError) {
          console.error("Error standards:", stdError);
          // CORRECCIÓN AQUÍ: Cambiado de "warning" a "destructive"
          toast({
            title: "Aviso",
            description: "Se guardó el equipo pero hubo error en la meta del checklist.",
            variant: "destructive"
          });
        }
      }

      toast({ title: "Éxito", description: "Equipo registrado correctamente.", variant: "success" });

      setFormData({ name: '', quantity: 0, category: '', recommended_quantity: 0 });
      onSuccess();
      onClose();

    } catch (error: any) {
      console.error(error);
      toast({ title: "Error", description: error.message || "No se pudo guardar.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Ingresar Nuevo Equipo</DialogTitle>
          <DialogDescription>Registra stock físico y define la meta para ambulancias.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-5 py-4">
          <div className="space-y-2">
            <Label>Nombre del Equipo</Label>
            <Input
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              placeholder="Ej: Collarín Cervical" required
            />
          </div>
          <div className="space-y-2">
            <Label>Categoría</Label>
            <Select value={formData.category} onValueChange={v => setFormData({ ...formData, category: v })}>
              <SelectTrigger><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
              <SelectContent>
                {categories.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Stock Almacén</Label>
              <div className="relative">
                <Input type="number" min="0" className="pl-9" value={formData.quantity}
                  onChange={e => setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })} required />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-indigo-600 font-bold flex items-center gap-1"><Target className="h-3 w-3" /> Meta Ambulancia</Label>
              <Input type="number" min="0" className="bg-indigo-50 border-indigo-200" value={formData.recommended_quantity}
                onChange={e => setFormData({ ...formData, recommended_quantity: parseInt(e.target.value) || 0 })} />
            </div>
          </div>
          <Button type="submit" disabled={isSubmitting} className="w-full bg-indigo-600 hover:bg-indigo-700">
            {isSubmitting ? "Guardando..." : "Guardar Registro"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};