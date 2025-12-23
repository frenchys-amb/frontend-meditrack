import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, ArrowRightLeft } from 'lucide-react';

// Mapeo exacto de tus categorías y sus tablas correspondientes
const CATEGORY_MAP: Record<string, { label: string, table: string }> = {
    canalizacion: { label: "Canalización", table: "storage_equipment" },
    Inmovilización: { label: "Inmovilización", table: "storage_equipment" },
    oxigeno_airway: { label: "Aire / Oxígeno", table: "storage_equipment" },
    miscelaneos: { label: "Misceláneos", table: "storage_equipment" },
    medicamentos: { label: "Medicamentos", table: "storage_medications" }, // Única en tabla de medicamentos
    entubacion: { label: "Entubación", table: "storage_equipment" },
    equipo: { label: "Equipo", table: "storage_equipment" },
};

export const MoveItemModal = ({ isOpen, onClose, item, currentTable }: any) => {
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [targetCategory, setTargetCategory] = useState("");

    const handleMove = async () => {
        if (!targetCategory || !item) return;
        setLoading(true);

        // Determinamos la tabla destino automáticamente según el mapeo anterior
        const toTable = CATEGORY_MAP[targetCategory].table;

        try {
            const { error } = await supabase.functions.invoke('move-inventory-item', {
                body: {
                    itemName: item.normalized_name || item.name,
                    fromTable: currentTable,
                    toTable: toTable,
                    newCategory: targetCategory,
                    originalId: item.id
                }
            });

            if (error) throw error;

            toast({
                title: "¡Éxito!",
                description: `Ítem movido a ${CATEGORY_MAP[targetCategory].label}`,
                className: "bg-green-600 text-white"
            });

            onClose();
            window.location.reload();
        } catch (err: any) {
            toast({ title: "Error", description: err.message, variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[400px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <ArrowRightLeft className="h-5 w-5 text-indigo-600" />
                        Reclasificar Insumo
                    </DialogTitle>
                    <DialogDescription>
                        Moviendo: <strong>{item?.name}</strong>
                    </DialogDescription>
                </DialogHeader>

                <div className="py-4">
                    <Select onValueChange={setTargetCategory}>
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Selecciona nueva categoría..." />
                        </SelectTrigger>
                        <SelectContent>
                            {Object.entries(CATEGORY_MAP).map(([key, config]) => (
                                <SelectItem key={key} value={key}>
                                    {config.label} {config.table === 'storage_medication' ? '(Medicamento)' : ''}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={loading}>
                        Cancelar
                    </Button>
                    <Button
                        onClick={handleMove}
                        disabled={loading || !targetCategory}
                        className="bg-indigo-600 hover:bg-indigo-700"
                    >
                        {loading ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : null}
                        Confirmar Cambio
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};