import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

interface Props {
    isOpen: boolean;
    onClose: () => void;
    item: { id: string; name: string } | null;
    onConfirm: (id: string) => Promise<void>; // Prop vital para el refresh
}

export const DeleteMedicationDialog: React.FC<Props> = ({ isOpen, onClose, item, onConfirm }) => {
    const { toast } = useToast();
    const [isDeleting, setIsDeleting] = useState(false);

    const handleConfirm = async () => {
        if (!item) return;
        setIsDeleting(true);
        try {
            // EJECUTAMOS LA FUNCIÓN QUE VIENE DEL PADRE
            await onConfirm(item.id);

            toast({
                title: "Eliminado",
                description: `${item.name} ha sido removido con éxito.`
            });
            onClose();
        } catch (error: any) {
            console.error("Error al eliminar:", error);
            toast({
                title: "Error",
                description: "No se pudo eliminar el registro.",
                variant: "destructive"
            });
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[400px] rounded-2xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-red-600 font-bold">
                        <AlertTriangle className="h-5 w-5" /> Confirmar Eliminación
                    </DialogTitle>
                    <DialogDescription className="pt-2">
                        ¿Estás seguro de eliminar <strong>{item?.name}</strong>?
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="mt-6 gap-2">
                    <Button variant="ghost" onClick={onClose} disabled={isDeleting}>Cancelar</Button>
                    <Button variant="destructive" onClick={handleConfirm} disabled={isDeleting} className="bg-red-600">
                        {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Eliminar'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};