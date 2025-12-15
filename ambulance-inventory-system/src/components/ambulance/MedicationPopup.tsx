import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

import { supabase } from "@/integrations/supabase/client";

interface MedicationPopupProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ambulanceId: string;
  onAdded: () => void;
  initialData?: any;
}

export default function MedicationPopup({
  open,
  onOpenChange,
  ambulanceId,
  onAdded,
  initialData,
}: MedicationPopupProps) {
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [expirationDate, setExpirationDate] = useState("");
  const [loading, setLoading] = useState(false);

  const isEditMode = !!initialData;

  useEffect(() => {
    if (!open) return;

    if (initialData) {
      setName(initialData.normalized_name || "");
      setQuantity(initialData.quantity || 1);
      setExpirationDate(initialData.expiration_date || "");
    } else {
      setName("");
      setQuantity(1);
      setExpirationDate("");
    }
  }, [open, initialData]);

  const handleClose = () => {
    onOpenChange(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ambulanceId) return;

    if (!name.trim()) {
      alert("El nombre es obligatorio.");
      return;
    }

    // En modo agregar, la fecha es obligatoria. En editar, la mantenemos como estaba si está deshabilitada.
    if (!isEditMode && !expirationDate) {
      alert("La fecha de expiración es obligatoria.");
      return;
    }

    setLoading(true);

    try {
      if (isEditMode) {
        await handleEdit();
      } else {
        await handleAdd();
      }
      onAdded();
      handleClose();
    } catch (err) {
      console.error(err);
      alert("Ocurrió un error al guardar.");
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    const normalized_name = name.toLowerCase().trim();

    const { data: existing } = await supabase
      .from("ambulance_medications")
      .select("*")
      .eq("ambulance_id", ambulanceId)
      .eq("normalized_name", normalized_name)
      .single();

    if (existing) {
      await supabase
        .from("ambulance_medications")
        .update({
          quantity: existing.quantity + quantity,
          expiration_date: expirationDate,
        })
        .eq("id", existing.id);
    } else {
      await supabase.from("ambulance_medications").insert({
        ambulance_id: ambulanceId,
        normalized_name,
        quantity,
        expiration_date: expirationDate,
      });
    }
  };

  const handleEdit = async () => {
    // Solo actualizamos la cantidad, respetando la solicitud.
    await supabase
      .from("ambulance_medications")
      .update({
        quantity: quantity,
        // No actualizamos fecha ni nombre en modo edición
      })
      .eq("id", initialData.id);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => (o ? onOpenChange(true) : handleClose())}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditMode ? "Editar Cantidad" : "Agregar Medicamento"}</DialogTitle>
          <DialogDescription>
            {isEditMode
              ? "Solo puedes modificar la cantidad del inventario existente."
              : "Ingresa manualmente los datos del medicamento."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSave} className="space-y-4">

          {/* NOMBRE */}
          <div>
            <Label>Nombre del Medicamento</Label>
            <Input
              type="text"
              placeholder="Ej: Adrenalina"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isEditMode} // Bloqueado en edición
              className={isEditMode ? "bg-slate-100 text-slate-500" : ""}
              required
            />
          </div>

          {/* CANTIDAD */}
          <div>
            <Label>Cantidad</Label>
            <Input
              type="number"
              min={1}
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              required
            />
          </div>

          {/* FECHA DE EXPIRACIÓN */}
          <div>
            <Label>Fecha de Expiración</Label>
            <Input
              type="date"
              value={expirationDate}
              onChange={(e) => setExpirationDate(e.target.value)}
              disabled={isEditMode} // Bloqueado en edición
              className={isEditMode ? "bg-slate-100 text-slate-500" : ""}
              required={!isEditMode}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Guardando..." : isEditMode ? "Actualizar Cantidad" : "Agregar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}