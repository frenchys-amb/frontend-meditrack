import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Loader2, Trash2 } from 'lucide-react';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (id: string) => Promise<void>;
    // Cambiamos string por string | null aquí para que coincida con el tipo User
    user: { id: string; full_name: string | null } | null;
}

export const DeleteUserDialog: React.FC<Props> = ({ isOpen, onClose, onConfirm, user }) => {
    const [isDeleting, setIsDeleting] = useState(false);

    const handleConfirm = async () => {
        if (!user) return;
        setIsDeleting(true);
        try {
            await onConfirm(user.id);
            onClose();
        } catch (error) {
            console.error("Error al eliminar:", error);
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[400px] rounded-3xl border-none shadow-2xl">
                <DialogHeader className="flex flex-col items-center">
                    <div className="h-16 w-16 bg-red-50 rounded-full flex items-center justify-center mb-4">
                        <AlertTriangle className="h-8 w-8 text-red-500" />
                    </div>
                    <DialogTitle className="text-2xl font-black text-slate-900">¿Eliminar Usuario?</DialogTitle>
                    <DialogDescription className="text-center text-slate-500 pt-2 text-base">
                        Estás a punto de eliminar a <strong className="text-slate-900">{user?.full_name}</strong>.<br />
                        Esta acción no se puede deshacer.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="flex-col sm:flex-row gap-3 mt-6">
                    <Button variant="ghost" onClick={onClose} disabled={isDeleting} className="w-full rounded-xl font-bold h-12">
                        Cancelar
                    </Button>
                    <Button variant="destructive" onClick={handleConfirm} disabled={isDeleting} className="w-full bg-red-600 hover:bg-red-700 rounded-xl font-bold h-12 shadow-lg shadow-red-200">
                        {isDeleting ? <Loader2 className="h-5 w-5 animate-spin" /> : <><Trash2 className="h-5 w-5 mr-2" /> Eliminar</>}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};