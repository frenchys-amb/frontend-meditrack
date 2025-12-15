import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAmbulances } from '@/hooks/useAmbulances';

export const useAmbulanceDetail = (unitId: string | undefined) => {
  const {
    ambulances,
    ambulanceEquipment: globalEquipment,
    ambulanceMedications: globalMedications,
    checklists: globalChecklists,
    isLoading: isGlobalLoading,
    fetchAmbulances
  } = useAmbulances();

  const [requisitions, setRequisitions] = useState<any[]>([]);
  const [usageLogs, setUsageLogs] = useState<any[]>([]);
  const [extraLoading, setExtraLoading] = useState(true);

  // 1. Identificar Ambulancia Actual
  const currentAmbulance = useMemo(() =>
    ambulances.find(a => a.unit_id === unitId),
    [ambulances, unitId]
  );
  
  const ambulanceUUID = currentAmbulance?.id;

  // 2. Filtrar y Ordenar Datos Globales
  const equipment = useMemo(() =>
    globalEquipment
      .filter(e => e.ambulance_id === ambulanceUUID)
      .sort((a, b) => a.category.localeCompare(b.category)),
    [globalEquipment, ambulanceUUID]
  );

  const medications = useMemo(() =>
    globalMedications
      .filter(m => m.ambulance_id === ambulanceUUID)
      .sort((a, b) => new Date(a.expiration_date).getTime() - new Date(b.expiration_date).getTime()),
    [globalMedications, ambulanceUUID]
  );

  const checklists = useMemo(() =>
    globalChecklists
      .filter(c => c.ambulance_id === ambulanceUUID)
      .sort((a, b) => new Date(b.created_at || b.date).getTime() - new Date(a.created_at || a.date).getTime()),
    [globalChecklists, ambulanceUUID]
  );

  // 3. Cargar Datos Adicionales (Requisiciones y Gastos)
  useEffect(() => {
    const loadExtraData = async () => {
      if (!ambulanceUUID) return;
      setExtraLoading(true);
      try {
        const [reqRes, useRes] = await Promise.all([
          supabase.from("requisitions").select("*").eq("ambulance_id", ambulanceUUID).order("created_at", { ascending: false }),
          supabase.from("equipment_usage").select("*").eq("ambulance_id", ambulanceUUID).order("created_at", { ascending: false })
        ]);
        
        if (reqRes.data) setRequisitions(reqRes.data);
        if (useRes.data) setUsageLogs(useRes.data);
      } catch (error) {
        console.error("Error loading extra detail data", error);
      } finally {
        setExtraLoading(false);
      }
    };
    loadExtraData();
  }, [ambulanceUUID]);

  const isLoading = isGlobalLoading || (!!ambulanceUUID && extraLoading);

  return {
    currentAmbulance,
    ambulanceUUID,
    equipment,
    medications,
    checklists,
    requisitions,
    usageLogs,
    isLoading,
    refresh: fetchAmbulances
  };
};