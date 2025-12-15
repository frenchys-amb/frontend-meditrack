import { supabase } from "@/lib/supabase";
import { InventoryMaps } from "../../types/inventory";

export async function adjustInventory(
  name: string,
  diff: number,
  ambulanceId: string,
  isMedication: boolean,
  maps: InventoryMaps,
  setMaps: (m: InventoryMaps) => void
) {
  if (diff === 0) return;

  const { equipMap, medsMap, storeEquipMap, storeMedMap } = maps;

  const ambMap = isMedication ? medsMap : equipMap;
  const storeMap = isMedication ? storeMedMap : storeEquipMap;

  const ambItem = ambMap[name];
  const storeItem = storeMap[name];

  const newAmb = (ambItem?.quantity ?? 0) + diff;
  const newStore = (storeItem?.quantity ?? 0) - diff;

  if (newAmb < 0) return alert("La ambulancia no puede quedar en negativo");
  if (newStore < 0) return alert("El almacén no tiene suficiente existencia");

  // update ambulance
  if (ambItem) {
    await supabase
      .from(isMedication ? "ambulance_medications" : "ambulance_equipment")
      .update({ quantity: newAmb })
      .eq("id", ambItem.id);
  } else {
    await supabase
      .from(isMedication ? "ambulance_medications" : "ambulance_equipment")
      .insert({
        ambulance_id: ambulanceId,
        normalized_name: name,
        quantity: newAmb,
        category: "auto",
      });
  }

  // update storage
  await supabase
    .from(isMedication ? "storage_medication" : "storage_equipment")
    .update({ quantity: newStore })
    .eq("id", storeItem.id);

  // Update local state
  ambMap[name] = { ...(ambItem || {}), quantity: newAmb };
  storeMap[name] = { ...(storeItem || {}), quantity: newStore };

  setMaps({ equipMap, medsMap, storeEquipMap, storeMedMap });
}
