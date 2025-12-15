import { supabase } from "@/lib/supabase";
import { InventoryMaps } from "../../types/inventory";

const VALID_CATEGORIES: (keyof InventoryMaps)[] = [
  "Inmovilización",
  "oxigeno_airway",
  "canalizacion",
  "miscelaneos",
  "medicamentos",
  "entubacion",
  "equipo_general",
];

function normalizeCategory(raw: any): keyof InventoryMaps {
  if (!raw) return "miscelaneos";
  const value = String(raw).toLowerCase().trim();

  if (value.includes("vital")) return "Inmovilización";
  if (value.includes("oxigen") || value.includes("oxygen")) return "oxigeno_airway";
  if (value.includes("canal")) return "canalizacion";
  if (value.includes("entub")) return "entubacion";
  if (value.includes("general")) return "equipo_general";
  if (value.includes("medic")) return "medicamentos";

  return "miscelaneos";
}

export async function loadInventory(ambulanceId: string): Promise<InventoryMaps> {
  const result = VALID_CATEGORIES.reduce((acc, category) => {
    acc[category] = [];
    return acc;
  }, {} as InventoryMaps);

  const { data: equip, error: equipErr } = await supabase
    .from("ambulance_equipment")
    .select("*")
    .eq("ambulance_id", ambulanceId);

  if (equipErr) console.error("equip error:", equipErr);

  const { data: meds, error: medsErr } = await supabase
    .from("ambulance_medications")
    .select("*")
    .eq("ambulance_id", ambulanceId);

  if (medsErr) console.error("meds error:", medsErr);

  const { data: storeEquip } = await supabase
    .from("storage_equipment")
    .select("*");

  const { data: storeMed } = await supabase
    .from("storage_medications") // ← corregido
    .select("*");

  const storageEquipMap = new Map(storeEquip?.map(s => [s.id, s]));
  const storageMedMap = new Map(storeMed?.map(s => [s.id, s]));

  equip?.forEach((row) => {
    const base = storageEquipMap.get(row.equipment_id);
    if (!base) return;

    const category = normalizeCategory(base.category);
    result[category].push({
      id: row.id,
      normalized_name: base.normalized_name,
      name: base.name,
      quantity: row.quantity,
      equipment_id: base.id,
      category
    });
  });

  meds?.forEach((row) => {
    const base = storageMedMap.get(row.medication_id);
    if (!base) return;

    result.medicamentos.push({
      id: row.id,
      normalized_name: base.normalized_name,
      name: base.name,
      quantity: row.quantity,
      medication_id: base.id,
      category: "medicamentos"
    });
  });

  return result;
}
