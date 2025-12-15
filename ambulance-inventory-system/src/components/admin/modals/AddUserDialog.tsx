// este va con userspage
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserCog, Loader2 } from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (user: any) => Promise<void>;
}

export const AddUserDialog = ({ isOpen, onClose, onConfirm }: Props) => {
  const [isLoading, setIsLoading] = useState(false);
  const [newUser, setNewUser] = useState({
    email: "", username: "", password: "", full_name: "", role: "paramedic"
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    await onConfirm(newUser);
    setIsLoading(false);
    setNewUser({ email: "", username: "", password: "", full_name: "", role: "paramedic" }); // Reset
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] rounded-2xl p-0 gap-0 overflow-hidden shadow-2xl">
        <DialogHeader className="p-6 bg-slate-50 border-b border-indigo-100">
          <DialogTitle className="text-2xl font-bold text-black flex items-center gap-2">
            <UserCog className="h-6 w-6 text-black" /> Crear Usuario
          </DialogTitle>
          <DialogDescription className="text-black/80">
            Completa los datos para registrar un nuevo miembro.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Username *</Label>
              <Input value={newUser.username} onChange={(e) => setNewUser({ ...newUser, username: e.target.value })} required className="rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label>Rol</Label>
              <Select value={newUser.role} onValueChange={(v) => setNewUser({ ...newUser, role: v })}>
                <SelectTrigger className="rounded-xl"><SelectValue placeholder="Rol" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="paramedic">Paramédico</SelectItem>
                  <SelectItem value="admin">Administrador</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Nombre Completo</Label>
            <Input value={newUser.full_name} onChange={(e) => setNewUser({ ...newUser, full_name: e.target.value })} className="rounded-xl" />
          </div>
          <div className="space-y-2">
            <Label>Email *</Label>
            <Input type="email" value={newUser.email} onChange={(e) => setNewUser({ ...newUser, email: e.target.value })} required className="rounded-xl" />
          </div>
          <div className="space-y-2">
            <Label>Contraseña *</Label>
            <Input type="password" value={newUser.password} onChange={(e) => setNewUser({ ...newUser, password: e.target.value })} required className="rounded-xl" />
          </div>

          <DialogFooter className="pt-4">
            <Button variant="outline" type="button" onClick={onClose} className="rounded-xl">Cancelar</Button>
            <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 rounded-xl" disabled={isLoading}>
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Crear Usuario"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};