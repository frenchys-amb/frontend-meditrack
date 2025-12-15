import { useState, useEffect } from "react";
import { StorageEquipment, StorageMedication } from "../types";
import { supabase } from "../lib/supabase";
import { normalizeName } from "../lib/nameNormalizer";

export const useInventory = () => {
  const [equipment, setEquipment] = useState<StorageEquipment[]>([]);
  const [medications, setMedications] = useState<StorageMedication[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    setIsLoading(true);
    try {
      const { data: equipmentData } = await supabase
        .from("storage_equipment")
        .select("*");
      setEquipment(equipmentData || []);

      const { data: medicationData } = await supabase
        .from("storage_medications")
        .select("*");
      setMedications(medicationData || []);
    } catch (error) {
      console.error("Error fetching inventory:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Función helper para registrar actividad
  const logActivity = async (
    action: string,
    entityType: string,
    entityId: string,
    details: any
  ) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        console.warn("No user authenticated for activity logging");
        return;
      }

      const { data, error } = await supabase.from("activity_log").insert({
        user_id: user.id,
        action,
        entity_type: entityType,
        entity_id: entityId,
        details,
      }).select();

      if (error) {
        console.error("Error logging activity:", error);
        console.error("Activity details:", { action, entityType, entityId, details });
      } else {
        console.log("Activity logged successfully:", data);
      }
    } catch (error) {
      console.error("Exception in logActivity:", error);
    }
  };

  const addEquipment = async (name: string, quantity: number, category: string) => {
    try {
      const normalizedName = normalizeName(name);

      // Verificar si existe
      const { data: existing } = await supabase
        .from("storage_equipment")
        .select("*")
        .eq("normalized_name", normalizedName)
        .maybeSingle();

      if (existing) {
        const newQuantity = existing.quantity + quantity;

        const { error } = await supabase
          .from("storage_equipment")
          .update({
            quantity: newQuantity,
            updated_at: new Date().toISOString(),
          })
          .eq("id", existing.id);

        if (error) throw error;

        await logActivity("update", "storage_equipment", existing.id, {
          name: existing.name,
          previous: existing.quantity,
          new: newQuantity,
          added: quantity,
        });
      } else {
        const { data, error } = await supabase
          .from("storage_equipment")
          .insert({
            name,
            normalized_name: normalizedName,
            quantity,
            category,
          })
          .select()
          .single();

        if (error) throw error;

        if (data) {
          await logActivity("create", "storage_equipment", data.id, {
            name,
            quantity,
            category,
          });
        }
      }

      await fetchInventory();
    } catch (error) {
      console.error("Error adding equipment:", error);
      throw error;
    }
  };

  const updateEquipment = async (id: string, quantity: number) => {
    try {
      const { data: existing, error: fetchError } = await supabase
        .from("storage_equipment")
        .select("*")
        .eq("id", id)
        .single();

      if (fetchError || !existing) {
        console.error("Equipment not found");
        return;
      }

      const { error } = await supabase
        .from("storage_equipment")
        .update({
          quantity,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id);

      if (error) throw error;

      await logActivity("update", "storage_equipment", id, {
        name: existing.name,
        previous: existing.quantity,
        new: quantity,
      });

      await fetchInventory();
    } catch (error) {
      console.error("Error updating equipment:", error);
      throw error;
    }
  };

  const deleteEquipment = async (id: string) => {
    try {
      const { data: existing, error: fetchError } = await supabase
        .from("storage_equipment")
        .select("*")
        .eq("id", id)
        .single();

      if (fetchError || !existing) {
        console.error("Equipment not found");
        return;
      }

      const { error } = await supabase
        .from("storage_equipment")
        .delete()
        .eq("id", id);

      if (error) throw error;

      await logActivity("delete", "storage_equipment", id, {
        name: existing.name,
        quantity: existing.quantity,
        category: existing.category,
      });

      await fetchInventory();
    } catch (error) {
      console.error("Error deleting equipment:", error);
      throw error;
    }
  };

  // MEDICATIONS ----------------------------------------

  const addMedication = async (name: string, quantity: number, expirationDate: string) => {
    try {
      const normalizedName = normalizeName(name);

      const { data: existing } = await supabase
        .from("storage_medications")
        .select("*")
        .eq("normalized_name", normalizedName)
        .maybeSingle();

      if (existing) {
        const newQuantity = existing.quantity + quantity;

        const { error } = await supabase
          .from("storage_medications")
          .update({
            quantity: newQuantity,
            updated_at: new Date().toISOString(),
          })
          .eq("id", existing.id);

        if (error) throw error;

        await logActivity("update", "storage_medications", existing.id, {
          name: existing.name,
          previous: existing.quantity,
          new: newQuantity,
          added: quantity,
        });
      } else {
        const { data, error } = await supabase
          .from("storage_medications")
          .insert({
            name,
            normalized_name: normalizedName,
            quantity,
            expiration_date: expirationDate,
          })
          .select()
          .single();

        if (error) throw error;

        if (data) {
          await logActivity("create", "storage_medications", data.id, {
            name,
            quantity,
            expiration_date: expirationDate,
          });
        }
      }

      await fetchInventory();
    } catch (error) {
      console.error("Error adding medication:", error);
      throw error;
    }
  };

  const updateMedication = async (id: string, quantity: number) => {
    try {
      const { data: existing, error: fetchError } = await supabase
        .from("storage_medications")
        .select("*")
        .eq("id", id)
        .single();

      if (fetchError || !existing) {
        console.error("Medication not found");
        return;
      }

      const { error } = await supabase
        .from("storage_medications")
        .update({
          quantity,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id);

      if (error) throw error;

      await logActivity("update", "storage_medications", id, {
        name: existing.name,
        previous: existing.quantity,
        new: quantity,
      });

      await fetchInventory();
    } catch (error) {
      console.error("Error updating medication:", error);
      throw error;
    }
  };

  const deleteMedication = async (id: string) => {
    try {
      const { data: existing, error: fetchError } = await supabase
        .from("storage_medications")
        .select("*")
        .eq("id", id)
        .single();

      if (fetchError || !existing) {
        console.error("Medication not found");
        return;
      }

      const { error } = await supabase
        .from("storage_medications")
        .delete()
        .eq("id", id);

      if (error) throw error;

      await logActivity("delete", "storage_medications", id, {
        name: existing.name,
        quantity: existing.quantity,
      });

      await fetchInventory();
    } catch (error) {
      console.error("Error deleting medication:", error);
      throw error;
    }
  };

  return {
    equipment,
    medications,
    isLoading,
    addEquipment,
    updateEquipment,
    deleteEquipment,
    addMedication,
    updateMedication,
    deleteMedication,
    fetchInventory,
  };
};