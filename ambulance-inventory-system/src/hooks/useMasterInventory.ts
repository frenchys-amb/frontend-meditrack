import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

type MasterCatalog = Record<string, string[]>;

export const useMasterInventory = () => {
  const [masterCatalog, setMasterCatalog] = useState<MasterCatalog>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCatalog = async () => {
      try {
        // 1. Equipos: Tienen categoría, así que la pedimos
        const { data: equip } = await supabase
          .from("storage_equipment")
          .select("normalized_name, category");

        // 2. Medicamentos: NO tienen categoría en BD, así que pedimos SOLO el nombre
        // CORRECCIÓN: Quitamos ", category" de aquí para evitar el Error 400
        const { data: meds } = await supabase
          .from("storage_medications")
          .select("normalized_name");

        const organized: MasterCatalog = {};

        // A. Procesamos EQUIPOS (usan su categoría real)
        equip?.forEach((item) => {
          const cat = item.category?.toLowerCase() || "miscelaneos";
          const name = item.normalized_name;
          if (!name) return;

          if (!organized[cat]) organized[cat] = [];
          if (!organized[cat].includes(name)) organized[cat].push(name);
        });

        // B. Procesamos MEDICAMENTOS (asignamos categoría manual "medicamentos")
        meds?.forEach((item) => {
          const cat = "medicamentos"; // <--- Forzamos la categoría aquí
          const name = item.normalized_name;
          if (!name) return;

          if (!organized[cat]) organized[cat] = [];
          if (!organized[cat].includes(name)) organized[cat].push(name);
        });

        setMasterCatalog(organized);
      } catch (error) {
        console.error("Error cargando catálogo:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCatalog();
  }, []);

  return { masterCatalog, loading };
};