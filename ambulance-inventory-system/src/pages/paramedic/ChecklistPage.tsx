import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom"; // 💡 Importar useNavigate para la redirección
import { useAmbulances } from "@/hooks/useAmbulances";
import { useInventoryStore } from "@/store/useInventoryStore";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useInventoryStandards } from "@/hooks/useInventoryStandards";
import { loadInventory } from "@/components/inventory/loadInventory";
import { ChecklistFormState } from "@/types/forms";
import { InventoryMaps, InventoryItem } from "@/types/inventory";
import { EMPTY_INVENTORY } from "@/data/constants";
import initialFormStateBase from "@/data/initialFormstate";
import { useActivityLog } from "@/hooks/useActivityLog";

// Iconos
import {
  Loader2,
  AlertTriangle,
  PackageSearch,
  Save,
  CheckCircle2,
} from "lucide-react";

// Componentes UI (Se asume que existen en sus respectivas rutas)
// Nota: Se elimina el Dialog/Modal de MissingItemsAlert, ya que se reemplaza por la redirección.
import { UnitInfoCard } from "@/components/checklist/sections/UnitInfoCard";
import { MechanicalCheckCard } from "@/components/checklist/sections/MechanicalCheckCard";
import { MedicalCheckCard } from "@/components/checklist/sections/MedicalCheckCard";
import { InventoryManager } from "@/components/checklist/sections/InventoryManager";

const SECTION_LABELS: Record<keyof InventoryMaps, string> = {
  canalizacion: "Canalización",
  Inmovilización: "Inmovilización",
  oxigeno_airway: "Aire / Oxígeno",
  miscelaneos: "Misceláneos",
  medicamentos: "Medicamentos",
  entubacion: "Entubación",
  equipo: "Equipo",
};

interface MissingItem {
  name: string;
  current: number;
  recommended: number;
  missing: number;
  section: string;
}

const TODAY = new Date().toISOString().split("T")[0];

// =============================================================================
// PÁGINA PRINCIPAL
// =============================================================================

export default function ChecklistPage() {
  const { toast } = useToast();
  const { logActivity } = useActivityLog();
  const navigate = useNavigate(); // 💡 Inicializar useNavigate

  const { ambulances } = useAmbulances();
  const { ambulanceId, setAmbulance, setInventory, inventory } = useInventoryStore();
  const { items: standardsList } = useInventoryStandards();

  // Estados Locales
  const [form, setForm] = useState<ChecklistFormState>(initialFormStateBase);
  const [selectedSection, setSelectedSection] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});

  // Referencia visual de estándares
  const recommendedInventory = useMemo(() => {
    const map: Record<string, Record<string, number>> = {};
    standardsList.forEach(item => {
      if (!map[item.category]) map[item.category] = {};
      map[item.category][item.normalized_name] = item.quantity;
    });
    return map;
  }, [standardsList]);

  // Carga inicial y obtención de userId
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => { if (data.user) setUserId(data.user.id); });

    if (!form.ambulance) return;
    const foundAmbulance = ambulances.find(a => a.unit_id === form.ambulance || (a as any).plate_number === form.ambulance);
    if (!foundAmbulance) return;

    setAmbulance(foundAmbulance.id);

    loadInventory(foundAmbulance.id).then((maps) => {
      setInventory(maps);
      setCheckedItems({});
    }).catch(() => toast({ title: "Error", description: "Error cargando inventario.", variant: "destructive" }));
  }, [form.ambulance, ambulances, setAmbulance, setInventory, toast]);

  // --- LÓGICA DE PROGRESO ---
  const calculateProgress = () => {
    if (!inventory) return 0;
    let totalItems = 0, completedItems = 0;
    Object.keys(SECTION_LABELS).forEach((key) => {
      const sectionKey = key as keyof InventoryMaps;
      const recommended = recommendedInventory[sectionKey] || {};
      Object.keys(recommended).forEach((itemName) => {
        totalItems++;
        if (checkedItems[itemName]) completedItems++;
      });
    });
    return totalItems === 0 ? 0 : Math.round((completedItems / totalItems) * 100);
  };
  const progressPercentage = calculateProgress();

  const handleBasicChange = (key: string, value: string) => setForm(prev => ({ ...prev, [key]: value }));

  // --- VALIDACIÓN Y CÁLCULO DE FALTANTES ---
  const validateFullInspection = (): boolean => {
    const unverifiedSections: string[] = [];
    Object.entries(recommendedInventory).forEach(([sectionKey, itemsMap]) => {
      let isSectionComplete = true;
      Object.keys(itemsMap).forEach((itemName) => {
        if (!checkedItems[itemName]) isSectionComplete = false;
      });
      if (!isSectionComplete) {
        const label = SECTION_LABELS[sectionKey as keyof InventoryMaps] || sectionKey;
        unverifiedSections.push(label);
      }
    });

    if (unverifiedSections.length > 0) {
      toast({
        title: "Inspección Incompleta",
        description: `Falta verificar ítems en: \n• ${unverifiedSections.join("\n• ")}`,
        variant: "destructive"
      });
      return false;
    }
    return true;
  };

  const checkMissingItems = (): MissingItem[] => {
    const currentInventory = inventory ?? EMPTY_INVENTORY;
    const missing: MissingItem[] = [];

    Object.entries(SECTION_LABELS).forEach(([sectionKey, sectionLabel]) => {
      const section = sectionKey as keyof InventoryMaps;
      const recommended = recommendedInventory[section] ?? {};
      const currentItems = currentInventory[section] || [];

      Object.entries(recommended).forEach(([itemName, targetQty]) => {
        const realItem = currentItems.find(i => i.normalized_name.toLowerCase().trim() === itemName.toLowerCase().trim());
        const currentQty = realItem?.quantity ?? 0;

        if (currentQty < targetQty) {
          missing.push({
            name: itemName,
            current: currentQty,
            recommended: targetQty,
            missing: targetQty - currentQty,
            section: sectionKey // Usamos la key de la sección como categoría de DB/Requisición
          });
        }
      });
    });
    return missing;
  };

  const sanitizeNumber = (val: string | number): number => {
    if (val === "" || val === null || val === undefined) return 0;
    const num = Number(val);
    return isNaN(num) ? 0 : num;
  };

  // --- GUARDAR EN DB (Solo inserta el Checklist) ---
  const executeSave = async (isRedirecting: boolean): Promise<boolean> => {
    if (!userId || !ambulanceId) {
      toast({ title: "Error de Sistema", description: "Falta ID de usuario o ambulancia.", variant: "destructive" });
      return false;
    }

    const currentInventory = inventory ?? EMPTY_INVENTORY;
    const missingCount = isRedirecting ? checkMissingItems().length : 0;

    const note = isRedirecting
      ? `Reporte guardado. Se redirigió para iniciar requisición de ${missingCount} ítems faltantes.`
      : (missingCount > 0
        ? `Reporte guardado con ${missingCount} ítems faltantes.`
        : "Inventario completo al 100%.");

    // Preparar Snapshot Ligero
    const cleanSnapshot: Record<string, any[]> = {};
    Object.keys(currentInventory).forEach((key) => {
      const items = currentInventory[key as keyof InventoryMaps] || [];
      cleanSnapshot[key] = items.map(item => ({ n: item.normalized_name, q: item.quantity }));
    });

    const payload = {
      ambulance_id: ambulanceId,
      user_id: userId,
      date: form.date,
      shift: form.shift,
      mileage: sanitizeNumber(form.millage),
      fuel: form.combustible,
      oxygen_m: sanitizeNumber(form.oxigeno_m),
      oxygen_d: sanitizeNumber(form.oxigeno_e),
      checklist_data: {
        fluids: {
          oil_engine: form.nivel_aceite_motor,
          transmission: form.nivel_transmision,
          brakes: form.nivel_frenos,
          steering: form.nivel_power_steering,
          coolant: form.nivel_coolant,
        },
        medical_equipment: {
          monitor: (form as any).eq_monitor_cardiaco,
          esfigmo_adulto: (form as any).eq_esfigmo_adulto,
          esfigmo_pediatrico: (form as any).eq_esfigmo_pediatrico,
          esfigmo_neonatal: (form as any).eq_esfigmo_neonatal,
          oximetro: (form as any).eq_oximetro,
          glucometro: (form as any).eq_glucometro,
          estetoscopio: (form as any).eq_estetoscopio,
          iv_pump: (form as any).eq_iv_pump,
          ventilador: (form as any).eq_ventilador,
        },
        observations: form.observaciones || "Checklist finalizado.",
        inventory_snapshot: cleanSnapshot,
        notes: note
      },
    };

    const { data: newChecklist, error } = await supabase
      .from("checklists")
      .insert(payload)
      .select()
      .single();

    if (error) {
      console.error(error);
      toast({ title: "Error", description: "No se pudo guardar el reporte.", variant: "destructive" });
      return false;
    }

    if (newChecklist) {
      await logActivity(
        "create",
        "checklists",
        newChecklist.id,
        {
          ambulance_id: ambulanceId,
          items_missing: missingCount,
          note: note
        }
      );
    }

    // 💡 Solo mostrar el toast si no vamos a redirigir
    if (!isRedirecting) {
      toast({
        title: "Reporte Guardado",
        description: missingCount > 0 ? "Se guardó con faltantes." : "Unidad verificada correctamente.",
        className: missingCount > 0 ? "bg-orange-600 text-white" : "bg-green-600 text-white"
      });

      // Reset solo si no hay redirección
      setForm({ ...initialFormStateBase, date: TODAY });
      setSelectedSection("");
      setCheckedItems({});
      setAmbulance("");
    }

    return true;
  };


  // --- BOTÓN FINALIZAR (Redirecciona o Guarda) ---
  const handlePreSubmit = async () => {
    if (!ambulanceId) return toast({ title: "Error", description: "Selecciona una ambulancia.", variant: "destructive" });
    if (!validateFullInspection()) return;

    setIsSubmitting(true);
    const missing = checkMissingItems();

    // 💡 Caso 1: Hay faltantes, redirigir
    if (missing.length > 0) {
      // 1. Guardar el Checklist (marcando que se redirige)
      const isSaved = await executeSave(true);

      if (isSaved) {
        // 2. Redirigir y pasar la lista de faltantes y el ID de la ambulancia
        navigate('/paramedic/requisition', { // 💡 Cambia '/requisition' a tu ruta real
          state: {
            preSelectedAmbulanceId: ambulanceId,
            preFillItems: missing.map(item => ({
              name: item.name,
              quantity: item.missing,
              category: item.section // Usamos la sección como la categoría de la requisición
            }))
          }
        });
        // No hacemos el reset aquí, lo manejará la página de requisición
      }
    }
    // 💡 Caso 2: No hay faltantes, solo guardar
    else {
      await executeSave(false);
      // El reset de estado ocurre dentro de executeSave(false)
    }

    setIsSubmitting(false);
  };

  // --- INVENTARIO UI ---
  const handleQuantityUpdate = (itemName: string, newQuantity: number) => {
    if (!selectedSection || !inventory) return;
    if (newQuantity < 0) newQuantity = 0;

    const sectionKey = selectedSection as keyof InventoryMaps;
    const currentList = [...(inventory[sectionKey] || [])];
    const itemIndex = currentList.findIndex(i => i.normalized_name.toLowerCase().trim() === itemName.toLowerCase().trim());

    if (itemIndex >= 0) {
      currentList[itemIndex] = { ...currentList[itemIndex], quantity: newQuantity };
    } else {
      currentList.push({
        id: "temp", normalized_name: itemName, quantity: newQuantity, category: selectedSection
      } as InventoryItem);
    }
    setInventory({ ...inventory, [sectionKey]: currentList });
    setCheckedItems(prev => ({ ...prev, [itemName]: true }));
  };

  const handleManualCheck = (itemName: string, currentQty: number, targetQty: number) => {
    const isCurrentlyChecked = checkedItems[itemName];
    if (!isCurrentlyChecked) {
      if (currentQty === 0) handleQuantityUpdate(itemName, targetQty);
      setCheckedItems(prev => ({ ...prev, [itemName]: true }));
    } else {
      setCheckedItems(prev => ({ ...prev, [itemName]: false }));
    }
  };

  const handleQuickFillSection = () => {
    if (!selectedSection || !inventory) return;
    const sectionKey = selectedSection as keyof InventoryMaps;
    const recommended = recommendedInventory[sectionKey] || {};
    const currentList = [...(inventory[sectionKey] || [])];
    const newCheckedState = { ...checkedItems };

    Object.entries(recommended).forEach(([itemName, targetQty]) => {
      const itemIndex = currentList.findIndex(i => i.normalized_name.toLowerCase().trim() === itemName.toLowerCase().trim());
      if (itemIndex >= 0) {
        currentList[itemIndex] = { ...currentList[itemIndex], quantity: targetQty };
      } else {
        currentList.push({
          id: "temp", normalized_name: itemName, quantity: targetQty, category: selectedSection
        } as InventoryItem);
      }
      newCheckedState[itemName] = true;
    });
    setInventory({ ...inventory, [sectionKey]: currentList });
    setCheckedItems(newCheckedState);
    toast({ title: "Sección Completada", description: `Sección actualizada al estándar.`, variant: "default" });
  };


  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-24">
      {/* HEADER */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 rounded-lg p-1.5 text-white">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-slate-900 leading-none">Hoja de Chequeo</h1>
                <p className="text-xs text-slate-500 font-medium mt-0.5">Auditoría de Unidad</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {form.ambulance && (
                <div className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200">
                  <div className={`w-2 h-2 rounded-full ${progressPercentage === 100 ? 'bg-emerald-500' : 'bg-blue-500'}`}></div>
                  <span className="text-sm font-semibold text-slate-700">{progressPercentage}%</span>
                </div>
              )}
            </div>
          </div>
        </div>
        {/* Barra de Progreso */}
        {form.ambulance && (
          <div className="w-full h-1 bg-slate-100">
            <div
              className={`h-full transition-all duration-500 ease-out ${progressPercentage === 100 ? 'bg-emerald-500' : 'bg-blue-600'}`}
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        )}
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

        {/* TARJETAS DE VERIFICACIÓN */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-4 flex flex-col gap-6 h-full">
            <UnitInfoCard form={form} ambulances={ambulances} onChange={handleBasicChange} />
          </div>
          <div className="lg:col-span-4 h-full">
            <MechanicalCheckCard form={form} onChange={handleBasicChange} />
          </div>
          <div className="lg:col-span-4 h-full">
            <MedicalCheckCard form={form} onChange={handleBasicChange} />
          </div>
        </div>

        {/* INVENTARIO */}
        <InventoryManager
          selectedSection={selectedSection}
          onSelectSection={setSelectedSection}
          sectionLabels={SECTION_LABELS}
          recommendedInventory={recommendedInventory}
          inventory={inventory}
          checkedItems={checkedItems}
          onUpdateQuantity={handleQuantityUpdate}
          onManualCheck={handleManualCheck}
          onQuickFill={handleQuickFillSection}
        />
      </main>

      {/* FOOTER */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-4 z-40 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        <div className="max-w-7xl mx-auto flex justify-end gap-4">
          <button
            onClick={handlePreSubmit}
            disabled={isSubmitting}
            className={`inline-flex items-center justify-center gap-2 px-8 py-3 rounded-lg font-semibold text-sm transition-all shadow-md hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed text-white
              ${isSubmitting ? 'bg-slate-700' : 'bg-slate-900 hover:bg-slate-800'}`}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Procesando...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Finalizar Auditoría
              </>
            )}
          </button>
        </div>
      </div>

      {/* El modal MissingItemsAlert ha sido ELIMINADO de este componente */}
    </div>
  );
}