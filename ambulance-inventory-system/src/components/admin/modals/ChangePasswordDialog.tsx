// este va con el userspage 
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock, Loader2 } from "lucide-react";
import { User } from "@/types";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  onConfirm: (id: string, pass: string) => Promise<void>;
}

export const ChangePasswordDialog = ({ isOpen, onClose, user, onConfirm }: Props) => {
  const [isLoading, setIsLoading] = useState(false);
  const [newPassword, setNewPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsLoading(true);
    await onConfirm(user.id, newPassword);
    setIsLoading(false);
    setNewPassword("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] rounded-2xl p-0 gap-0 overflow-hidden">
        <DialogHeader className="p-6 bg-amber-50 border-b border-amber-100">
          <DialogTitle className="text-2xl font-bold text-amber-800 flex items-center gap-2">
            <Lock className="h-6 w-6 text-amber-600" /> Restablecer Contraseña
          </DialogTitle>
          <DialogDescription className="text-amber-700">Para usuario <b>@{user?.username}</b>.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="space-y-2">
            <Label>Nueva Contraseña</Label>
            <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required placeholder="••••••••" className="rounded-xl" />
            <p className="text-xs text-slate-500">Mínimo 6 caracteres.</p>
          </div>
          <DialogFooter className="pt-4">
            <Button variant="outline" onClick={onClose} className="rounded-xl">Cancelar</Button>
            <Button disabled={isLoading || newPassword.length < 6} type="submit" className="bg-amber-600 hover:bg-amber-700 rounded-xl">
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Guardar Contraseña"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};