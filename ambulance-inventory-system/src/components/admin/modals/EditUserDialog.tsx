// este va con userspage
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Edit, Loader2 } from "lucide-react";
import { User } from "@/types";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  onConfirm: (id: string, data: any) => Promise<void>;
}

export const EditUserDialog = ({ isOpen, onClose, user, onConfirm }: Props) => {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<any>({});

  useEffect(() => {
    if (user) setFormData({ ...user });
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsLoading(true);
    await onConfirm(user.id, {
      username: formData.username,
      full_name: formData.full_name,
      role: formData.role
    });
    setIsLoading(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] rounded-2xl p-0 gap-0 overflow-hidden">
        <DialogHeader className="p-6 bg-slate-50 border-b border-indigo-100">
          <DialogTitle className="text-2xl font-bold text-black flex items-center gap-2">
            <Edit className="h-6 w-6 text-black" /> Editar Usuario
          </DialogTitle>
          <DialogDescription className="text-black">Modifica los detalles del usuario.</DialogDescription>
        </DialogHeader>

        {user && (
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            <div className="space-y-2">
              <Label>Username</Label>
              <Input value={formData.username || ''} onChange={(e) => setFormData({ ...formData, username: e.target.value })} required className="rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label>Nombre Completo</Label>
              <Input value={formData.full_name || ''} onChange={(e) => setFormData({ ...formData, full_name: e.target.value })} className="rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label>Rol</Label>
              <Select value={formData.role} onValueChange={(v) => setFormData({ ...formData, role: v })}>
                <SelectTrigger className="rounded-xl"><SelectValue placeholder="Rol" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="paramedic">Paramédico</SelectItem>
                  <SelectItem value="admin">Administrador</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <DialogFooter className="pt-4">
              <Button variant="outline" onClick={onClose} className="rounded-xl">Cancelar</Button>
              <Button type="submit" className="bg-indigo-600 rounded-xl" disabled={isLoading}>
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Guardar Cambios"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};