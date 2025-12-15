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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { supabase } from "@/integrations/supabase/client";
import { Package, Layers, Hash, Save, X, Edit3 } from "lucide-react"; // Importamos iconos

interface EquipmentPopupProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ambulanceId: string;
  onAdded: () => void;
  initialData?: any;
}

export default function EquipmentPopup({
  open,
  onOpenChange,
  ambulanceId,
  onAdded,
  initialData,
}: EquipmentPopupProps) {
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(false);

  const isEditMode = !!initialData;

  const categories = [
    { value: "signos_vitales", label: "Signos Vitales" },
    { value: "oxigeno_airway", label: "Oxígeno/Airway" },
    { value: "canalizacion", label: "Canalización" },
    { value: "miscelaneos", label: "Misceláneos" },
    { value: "entubacion", label: "Entubación" },

    { value: "equipo_general", label: "Equipo General" },
  ];

  useEffect(() => {
    if (!open) return;

    if (initialData) {
      setName(initialData.normalized_name || "");
      setQuantity(initialData.quantity || 1);
      setCategory(initialData.category || "");
    } else {
      setName("");
      setQuantity(1);
      setCategory("");
    }
  }, [open, initialData]);

  const handleClose = () => {
    onOpenChange(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ambulanceId) return;

    if (!name.trim()) {
      alert("El nombre del equipo es obligatorio.");
      return;
    }
    if (!category) {
      alert("La categoría es obligatoria.");
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
      .from("ambulance_equipment")
      .select("*")
      .eq("ambulance_id", ambulanceId)
      .eq("normalized_name", normalized_name)
      .single();

    if (existing) {
      await supabase
        .from("ambulance_equipment")
        .update({ quantity: existing.quantity + quantity })
        .eq("id", existing.id);
    } else {
      await supabase.from("ambulance_equipment").insert({
        ambulance_id: ambulanceId,
        normalized_name,
        quantity,
        category,
      });
    }
  };

  const handleEdit = async () => {
    await supabase
      .from("ambulance_equipment")
      .update({
        quantity: quantity,
        normalized_name: name.toLowerCase().trim(),
        category: category,
      })
      .eq("id", initialData.id);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => (o ? onOpenChange(true) : handleClose())}>
      <DialogContent className="sm:max-w-[450px] p-0 overflow-hidden rounded-2xl gap-0">

        {/* HEADER CON COLOR SUAVE */}
        <DialogHeader className="px-6 py-6 bg-slate-50 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl ${isEditMode ? 'bg-amber-100 text-amber-600' : 'bg-indigo-100 text-indigo-600'}`}>
              {isEditMode ? <Edit3 className="h-5 w-5" /> : <Package className="h-5 w-5" />}
            </div>
            <div>
              <DialogTitle className="text-xl font-bold text-slate-800">
                {isEditMode ? "Editar Equipo" : "Nuevo Equipo"}
              </DialogTitle>
              <DialogDescription className="text-slate-500 mt-1">
                {isEditMode
                  ? "Modifica los detalles del insumo seleccionado."
                  : "Registra manualmente un equipo en la unidad."}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSave} className="px-6 py-6 space-y-5">

          {/* CAMPO: NOMBRE */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-slate-700 font-semibold flex items-center gap-2">
              Nombre del Equipo <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <Package className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                id="name"
                placeholder="Ej: Collarín Cervical"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="pl-10 h-11 bg-slate-50 border-slate-200 focus:bg-white transition-all rounded-xl"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* CAMPO: CATEGORÍA */}
            <div className="space-y-2 col-span-2 sm:col-span-1">
              <Label htmlFor="category" className="text-slate-700 font-semibold flex items-center gap-2">
                Categoría <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Layers className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 z-10 pointer-events-none" />
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className="pl-10 h-11 bg-slate-50 border-slate-200 rounded-xl">
                    <SelectValue placeholder="Tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => (
                      <SelectItem key={c.value} value={c.value}>
                        {c.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* CAMPO: CANTIDAD */}
            <div className="space-y-2 col-span-2 sm:col-span-1">
              <Label htmlFor="quantity" className="text-slate-700 font-semibold flex items-center gap-2">
                Cantidad <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  id="quantity"
                  type="number"
                  min={1}
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  className="pl-10 h-11 bg-slate-50 border-slate-200 focus:bg-white transition-all rounded-xl"
                  required
                />
              </div>
            </div>
          </div>

          {/* FOOTER */}
          <DialogFooter className="pt-4 flex gap-2 sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="rounded-xl border-slate-200 text-slate-600 hover:bg-slate-50 h-11"
            >
              <X className="w-4 h-4 mr-2" />
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-md shadow-indigo-200 h-11 px-6"
            >
              {loading ? (
                "Guardando..."
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  {isEditMode ? "Actualizar" : "Guardar"}
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}