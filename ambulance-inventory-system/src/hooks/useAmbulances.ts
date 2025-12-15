import { useState, useEffect } from "react";
import {
  Ambulance,
  AmbulanceEquipment,
  AmbulanceMedication,
  Checklist,
  StorageEquipment,
  StorageMedication
} from "../types";
import { supabase } from "../lib/supabase";
import { normalizeName } from "../lib/nameNormalizer";
import { getFullRecommendedInventory } from "../data/recommendedInventory";

export const useAmbulances = () => {
  const [ambulances, setAmbulances] = useState<Ambulance[]>([]);
  const [ambulanceEquipment, setAmbulanceEquipment] = useState<AmbulanceEquipment[]>([]);
  const [ambulanceMedications, setAmbulanceMedications] = useState<AmbulanceMedication[]>([]);
  const [checklists, setChecklists] = useState<Checklist[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // ---------------------------------------------------------
  // 1. CARGA DE DATOS
  // ---------------------------------------------------------
  useEffect(() => {
    fetchAmbulances();
  }, []);

  const fetchAmbulances = async () => {
    setIsLoading(true);
    try {
      const { data: ambulanceData } = await supabase.from("ambulances").select("*");
      setAmbulances(ambulanceData || []);

      const { data: eq } = await supabase.from("ambulance_equipment").select("*");
      setAmbulanceEquipment(eq || []);

      const { data: meds } = await supabase.from("ambulance_medications").select("*");
      setAmbulanceMedications(meds || []);

      const { data: ch } = await supabase.from("checklists").select("*");
      setChecklists(ch || []);
    } catch (e) {
      console.error("Error fetching data:", e);
    } finally {
      setIsLoading(false);
    }
  };

  // ---------------------------------------------------------
  // 2. GETTERS
  // ---------------------------------------------------------
  const getAmbulanceById = async (id: string) => {
    const { data } = await supabase.from("ambulances").select("*").eq("id", id).maybeSingle<Ambulance>();
    return data;
  };

  const getAmbulanceEquipmentList = async (ambulanceId: string) => {
    const { data } = await supabase.from("ambulance_equipment").select("*").eq("ambulance_id", ambulanceId);
    return data || [];
  };

  const getAmbulanceMedicationsList = async (ambulanceId: string) => {
    const { data } = await supabase.from("ambulance_medications").select("*").eq("ambulance_id", ambulanceId);
    return data || [];
  };

  // ---------------------------------------------------------
  // 3. REQUISICIÓN LEGACY (Mantener por compatibilidad)
  // ---------------------------------------------------------
  const createRequisition = async (
    ambulanceId: string,
    date: string,
    requisitionData: Record<string, number>
  ) => {
    // ... (Tu código original intacto) ...
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Usuario no autenticado");

    for (const [item, qty] of Object.entries(requisitionData)) {
      const normalized = normalizeName(item);

      // A. INTENTAR COMO EQUIPO
      const { data: storageEq } = await supabase
        .from("storage_equipment")
        .select("*")
        .eq("normalized_name", normalized)
        .maybeSingle<StorageEquipment>();

      if (storageEq) {
        if (storageEq.quantity < qty) throw new Error(`Stock insuficiente de equipo: ${item}`);

        await supabase.from("storage_equipment")
          .update({ quantity: storageEq.quantity - qty })
          .eq("id", storageEq.id);

        const { data: ambEq } = await supabase
          .from("ambulance_equipment")
          .select("*")
          .eq("ambulance_id", ambulanceId)
          .eq("normalized_name", normalized)
          .maybeSingle<AmbulanceEquipment>();

        if (ambEq) {
          await supabase.from("ambulance_equipment")
            .update({ quantity: ambEq.quantity + qty })
            .eq("id", ambEq.id);
        } else {
          await supabase.from("ambulance_equipment").insert({
            ambulance_id: ambulanceId,
            equipment_id: storageEq.id,
            normalized_name: normalized,
            quantity: qty,
            category: storageEq.category,
          });
        }
      }
      // B. SI NO ES EQUIPO, INTENTAR COMO MEDICAMENTO
      else {
        const { data: storageMed } = await supabase
          .from("storage_medications")
          .select("*")
          .eq("normalized_name", normalized)
          .maybeSingle<StorageMedication>();

        if (storageMed) {
          if (storageMed.quantity < qty) throw new Error(`Stock insuficiente de medicamento: ${item}`);

          await supabase.from("storage_medications")
            .update({ quantity: storageMed.quantity - qty })
            .eq("id", storageMed.id);

          const { data: ambMed } = await supabase
            .from("ambulance_medications")
            .select("*")
            .eq("ambulance_id", ambulanceId)
            .eq("normalized_name", normalized)
            .maybeSingle<AmbulanceMedication>();

          if (ambMed) {
            await supabase.from("ambulance_medications")
              .update({ quantity: ambMed.quantity + qty })
              .eq("id", ambMed.id);
          } else {
            await supabase.from("ambulance_medications").insert({
              ambulance_id: ambulanceId,
              medication_id: storageMed.id,
              normalized_name: normalized,
              quantity: qty,
              expiration_date: storageMed.expiration_date
            });
          }
        } else {
          throw new Error(`El item "${item}" no existe ni en Equipos ni en Medicamentos.`);
        }
      }
    }

    const { data } = await supabase.from("requisitions").insert({
      ambulance_id: ambulanceId,
      user_id: user.id,
      date,
      requisition_data: requisitionData,
    }).select().single();

    if (data) {
      await logActivity("create", "requisitions", data.id, {
        ambulance_id: ambulanceId,
        items_count: Object.keys(requisitionData).length
      });
    }

    await fetchAmbulances();
  };

  // ---------------------------------------------------------
  // 🆕 3.5 NUEVA FUNCIÓN: CREATE MANUAL REQUISITION
  // (Usa la automatización SQL y acepta Array detallado)
  // ---------------------------------------------------------
  const createManualRequisition = async (
    ambulanceId: string,
    date: string,
    itemsPayload: any[] // Aceptamos el array completo con {name, missing_qty, type}
  ) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Usuario no autenticado");

    // Preparamos el JSONB para la columna requisition_data
    // El Trigger SQL leerá 'items' y hará las transferencias automáticamente
    const requisitionDataJSON = {
      generated_at: new Date().toISOString(),
      reason: 'Manual Web Requisition',
      items: itemsPayload
    };

    // Insertamos directamente. El Trigger 'procesar_transferencia_automatica' hará el resto.
    const { data, error } = await supabase
      .from('requisitions')
      .insert({
        ambulance_id: ambulanceId,
        user_id: user.id,
        date: date,
        requisition_data: requisitionDataJSON
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating manual requisition:", error);
      throw error;
    }

    if (data) {
      await logActivity("create", "requisitions", data.id, {
        method: "manual_web_v2",
        items_count: itemsPayload.length
      });
    }

    // Refrescamos los datos para ver los cambios en inventario inmediatamente
    await fetchAmbulances();
    return true;
  };

  // ---------------------------------------------------------
  // 4. REPORTE DE USO INTELIGENTE
  // ---------------------------------------------------------
  const recordEquipmentUsage = async (
    ambulanceId: string,
    date: string,
    usageData: Record<string, number>
  ) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("No user");

    const { data: usageRecord, error } = await supabase.from("equipment_usage").insert({
      ambulance_id: ambulanceId,
      user_id: user.id,
      date,
      usage_data: usageData,
    }).select().single();

    if (error) throw error;

    for (const [name, qty] of Object.entries(usageData)) {
      const normalized = normalizeName(name);

      const { data: ambEq } = await supabase
        .from("ambulance_equipment")
        .select("*")
        .eq("ambulance_id", ambulanceId)
        .eq("normalized_name", normalized)
        .maybeSingle<AmbulanceEquipment>();

      if (ambEq) {
        const newQty = ambEq.quantity - qty;
        if (newQty > 0) {
          await supabase.from("ambulance_equipment").update({ quantity: newQty }).eq("id", ambEq.id);
        } else {
          await supabase.from("ambulance_equipment").delete().eq("id", ambEq.id);
        }
        continue;
      }

      const { data: ambMed } = await supabase
        .from("ambulance_medications")
        .select("*")
        .eq("ambulance_id", ambulanceId)
        .eq("normalized_name", normalized)
        .maybeSingle<AmbulanceMedication>();

      if (ambMed) {
        const newQty = ambMed.quantity - qty;
        if (newQty > 0) {
          await supabase.from("ambulance_medications").update({ quantity: newQty }).eq("id", ambMed.id);
        } else {
          await supabase.from("ambulance_medications").delete().eq("id", ambMed.id);
        }
      }
    }

    if (usageRecord) {
      await logActivity("create", "equipment_usage", usageRecord.id, { ambulance_id: ambulanceId });
    }

    await fetchAmbulances();
  };

  // ---------------------------------------------------------
  // 5. CHECKLIST
  // ---------------------------------------------------------
  const saveChecklist = async (
    ambulanceId: string,
    date: string,
    checklistData: Record<string, boolean>,
    notes: string
  ) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("No user");

    const { data, error } = await supabase.from("checklists").insert({
      ambulance_id: ambulanceId,
      user_id: user.id,
      date,
      checklist_data: checklistData,
      notes,
    }).select().single();

    if (error) throw error;

    if (data) {
      await logActivity("create", "checklists", data.id, { ambulance_id: ambulanceId });
    }

    await fetchAmbulances();
  };

  // ---------------------------------------------------------
  // 6. ESTADO DE INVENTARIO
  // ---------------------------------------------------------
  const getAmbulanceInventoryStatus = async (ambulanceId: string) => {
    const recommended = getFullRecommendedInventory() as Record<string, Record<string, number>>;
    const equipment = await getAmbulanceEquipmentList(ambulanceId);
    const medications = await getAmbulanceMedicationsList(ambulanceId);

    const current: Record<string, Record<string, number>> = {};

    equipment.forEach((item) => {
      if (!current[item.category]) current[item.category] = {};
      current[item.category][item.normalized_name] = item.quantity;
    });

    medications.forEach((m) => {
      if (!current["medications"]) current["medications"] = {};
      current["medications"][m.normalized_name] = m.quantity;
    });

    const status: Record<
      string,
      Record<string, { current: number; recommended: number; missing: number }>
    > = {};

    for (const category of Object.keys(recommended)) {
      status[category] = {};

      for (const item of Object.keys(recommended[category])) {
        const rec = recommended[category][item];
        const normalized = normalizeName(item);
        const cur = current[category]?.[normalized] ?? 0;

        status[category][item] = {
          current: cur,
          recommended: rec,
          missing: Math.max(0, rec - cur),
        };
      }
    }

    return status;
  };

  const logActivity = async (action: string, type: string, id: string, details: any) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from("activity_log").insert({
          user_id: user.id,
          action,
          entity_type: type,
          entity_id: id,
          details
        });
      }
    } catch (e) { console.error("Log error", e); }
  };

  return {
    ambulances,
    ambulanceEquipment,
    ambulanceMedications,
    checklists,
    isLoading,
    getAmbulanceById,
    getAmbulanceEquipmentList,
    getAmbulanceMedicationsList,
    createRequisition,       // Vieja (Mantener por si acaso)
    createManualRequisition, // NUEVA (Usar en RequisitionPage)
    recordEquipmentUsage,
    saveChecklist,
    getAmbulanceInventoryStatus,
    fetchAmbulances
  };
};