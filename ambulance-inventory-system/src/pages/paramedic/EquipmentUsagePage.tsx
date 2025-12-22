import React, { useState, useCallback } from 'react';
import { Minus, Trash2, ClipboardList, ChevronDown, Zap, CheckCircle, AlertTriangle, Truck, Loader2, Activity, Box } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useAmbulances } from '@/hooks/useAmbulances'; // <--- IMPORTACIÓN DEL HOOK

// =========================================================================
// TIPOS
// =========================================================================

interface AmbulanceItem {
  id: string;
  normalized_name: string;
  quantity: number;
  category: string;
  medication_id?: string;
  equipment_id?: string;
}

interface CartItem {
  id: string;
  name: string;
  quantity: number;
  sourceTable: string;
  maxQuantity: number;
  originalItemId: string;
}

// =========================================================================
// CONFIGURACIÓN
// =========================================================================

const TABLE_AMBULANCE_MEDICATION = 'ambulance_medications';
const TABLE_AMBULANCE_EQUIPMENT = 'ambulance_equipment';

const categories = [
  { value: "medicamento", label: "Medicamentos (Farmacia)" },
  { value: "Inmovilización", label: "Inmovilización" },
  { value: "oxigeno_airway", label: "Oxígeno/Airway" },
  { value: "canalizacion", label: "Canalización" },
  { value: "miscelaneos", label: "Misceláneos" },
  { value: "entubacion", label: "Entubación" },
  { value: "equipo", label: "Equipo General" },
];

// =========================================================================
// COMPONENTES UI (Mismo estilo responsivo y limpio)
// =========================================================================

const AdaptiveContainer: React.FC<{
  children: React.ReactNode,
  title: string,
  subtitle: string
}> = ({ children, title, subtitle }) => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center py-4 sm:py-8 px-3 sm:px-6 font-sans">
      <div className="w-full max-w-6xl">
        <div className="mb-6 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">{title}</h1>
            <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
          </div>
          <div className="hidden md:flex items-center gap-2">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800 border border-orange-200">
              <Activity className="w-3 h-3 mr-1" /> Modo Consumo
            </span>
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden flex flex-col lg:flex-row">
          {children}
        </div>
      </div>
    </div>
  );
};

const Label: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <label className="block text-xs sm:text-sm font-bold text-slate-700 mb-1.5 ml-1 uppercase tracking-wide opacity-80">{children}</label>
);

const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = (props) => (
  <input
    {...props}
    className="w-full p-3 text-sm sm:text-base border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all outline-none disabled:opacity-60"
  />
);

const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'dark' }> = ({ children, className, variant = 'primary', ...props }) => {
  const baseStyle = "w-full flex items-center justify-center px-4 py-3.5 sm:py-3 text-sm sm:text-base font-bold rounded-xl shadow-sm transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation";
  const variants = {
    primary: "border-transparent text-white bg-orange-600 hover:bg-orange-700 shadow-orange-200",
    secondary: "border-slate-200 text-slate-700 bg-white hover:bg-slate-50",
    dark: "border-transparent text-white bg-slate-900 hover:bg-slate-800 shadow-slate-300"
  };
  return (
    <button {...props} className={`${baseStyle} ${variants[variant]} ${className}`}>
      {children}
    </button>
  );
};

const NativeSelect: React.FC<{
  value: string,
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void,
  disabled?: boolean,
  children: React.ReactNode
}> = ({ value, onChange, disabled, children }) => {
  return (
    <div className="relative w-full group">
      <select
        value={value}
        onChange={onChange}
        disabled={disabled}
        className="w-full p-3 pl-3 pr-10 text-sm sm:text-base border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all appearance-none cursor-pointer outline-none disabled:bg-slate-100 disabled:text-slate-400 truncate"
      >
        {children}
      </select>
      <div className="absolute inset-y-0 right-0 flex items-center px-3 text-slate-400 pointer-events-none">
        <ChevronDown className="h-4 w-4 sm:h-5 sm:w-5" />
      </div>
    </div>
  );
};

// =========================================================================
// TOAST HOOK
// =========================================================================
const useToast = () => {
  const [toasts, setToasts] = useState<any[]>([]);
  const toast = ({ title, description, variant }: { title: string, description: string, variant: 'default' | 'destructive' | 'success' }) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, title, description, variant }]);
    setTimeout(() => setToasts((prev) => prev.filter(t => t.id !== id)), 4000);
  };
  const ToastContainer: React.FC = () => (
    <div className="fixed top-4 right-4 z-[100] space-y-3 pointer-events-none w-full max-w-sm px-4 sm:px-0">
      {toasts.map((t) => {
        let styles = "bg-white border-slate-200 text-slate-800";
        let Icon = Zap;
        if (t.variant === 'destructive') { styles = "bg-red-50 border-red-100 text-red-900"; Icon = AlertTriangle; }
        else if (t.variant === 'success') { styles = "bg-emerald-50 border-emerald-100 text-emerald-900"; Icon = CheckCircle; }

        return (
          <div key={t.id} className={`p-4 rounded-2xl shadow-xl border flex items-start space-x-3 animate-in slide-in-from-top-5 duration-300 ${styles}`}>
            <Icon className={`h-5 w-5 mt-0.5 flex-shrink-0 ${t.variant === 'destructive' ? 'text-red-600' : t.variant === 'success' ? 'text-emerald-600' : 'text-orange-600'}`} />
            <div>
              <div className="font-bold text-sm">{t.title}</div>
              <div className="text-xs opacity-90 leading-relaxed">{t.description}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
  return { toast, ToastContainer };
};

// =========================================================================
// COMPONENTE PRINCIPAL
// =========================================================================

const EquipamentUsagePage = () => {
  const { toast, ToastContainer } = useToast();
  const { user } = useAuth();

  // 1. Usar Hook de Ambulancias
  const {
    ambulances,
    recordEquipmentUsage,
    isLoading: isHookLoading
  } = useAmbulances();

  const [ambulanceId, setAmbulanceId] = useState("");
  const [category, setCategory] = useState<string>("");

  const [itemList, setItemList] = useState<AmbulanceItem[]>([]);
  const [selectedItemId, setSelectedItemId] = useState<string>("");
  const [quantity, setQuantity] = useState(1);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentItem = itemList.find((e) => e.id === selectedItemId);

  // 2. Cargar Inventario (Consulta Directa para filtrado específico)
  const loadAmbulanceInventory = useCallback(async (selectedAmbId: string, selectedCat: string) => {
    if (!selectedAmbId || !selectedCat) return;

    setSelectedItemId("");
    setQuantity(1);
    setItemList([]);

    let query;
    if (selectedCat === "medicamento") {
      query = supabase.from(TABLE_AMBULANCE_MEDICATION).select("*").eq("ambulance_id", selectedAmbId).gt("quantity", 0).order("normalized_name");
    } else {
      query = supabase.from(TABLE_AMBULANCE_EQUIPMENT).select("*").eq("ambulance_id", selectedAmbId).eq("category", selectedCat).gt("quantity", 0).order("normalized_name");
    }

    const { data, error } = await query;

    if (error) {
      toast({ title: "Error", description: "No se pudo cargar el inventario.", variant: "destructive" });
    } else {
      setItemList(data as AmbulanceItem[] || []);
      if (data?.length === 0) {
        toast({ title: "Sin Stock", description: "Categoría vacía en la unidad.", variant: "default" });
      }
    }
  }, []);

  const handleAmbulanceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newId = e.target.value;
    setAmbulanceId(newId);
    setCart([]);
    if (category) loadAmbulanceInventory(newId, category);
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCat = e.target.value;
    setCategory(newCat);
    if (ambulanceId) loadAmbulanceInventory(ambulanceId, newCat);
  };

  const handleAddToUsageList = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentItem) return;
    if (quantity < 0) return toast({ title: "Error", description: "Cantidad inválida.", variant: "destructive" });
    if (quantity > currentItem.quantity) return toast({ title: "Stock Insuficiente", description: "No puedes gastar más de lo disponible.", variant: "destructive" });

    const existingIndex = cart.findIndex(item => item.id === currentItem.id);
    const sourceTable = category === 'medicamento' ? TABLE_AMBULANCE_MEDICATION : TABLE_AMBULANCE_EQUIPMENT;

    if (existingIndex >= 0) {
      const newCart = [...cart];
      const newTotal = newCart[existingIndex].quantity + quantity;
      if (newTotal > currentItem.quantity) return toast({ title: "Límite", description: "Excedes el stock real.", variant: "destructive" });
      newCart[existingIndex].quantity = newTotal;
      setCart(newCart);
    } else {
      setCart([...cart, {
        id: currentItem.id,
        name: currentItem.normalized_name,
        quantity: quantity,
        maxQuantity: currentItem.quantity,
        sourceTable: sourceTable,
        originalItemId: category === 'medicamento' ? (currentItem.medication_id || '') : (currentItem.equipment_id || '')
      }]);
    }
    setQuantity(0);
    toast({ title: "Registrado", description: "Item agregado al reporte.", variant: "success" });
  };

  const removeFromCart = (id: string) => setCart(cart.filter(item => item.id !== id));

  // 3. Confirmar Uso (Usando Hook)
  const handleConfirmUsage = async () => {
    if (!user) return toast({ title: "Sesión", description: "Sin sesión activa.", variant: "destructive" });
    if (!ambulanceId) return toast({ title: "Falta Unidad", description: "Selecciona una ambulancia.", variant: "destructive" });

    setIsSubmitting(true);

    try {
      // Convertir Array a Objeto Record<string, number> para el hook
      const usageData: Record<string, number> = {};

      cart.forEach(item => {
        // El hook usa el nombre normalizado para buscar y descontar inteligentemente
        usageData[item.name] = item.quantity;
      });

      const date = new Date().toISOString().split('T')[0];

      // LLAMADA AL HOOK (Maneja transacción + Activity Log)
      await recordEquipmentUsage(ambulanceId, date, usageData);

      toast({ title: "Reporte Enviado", description: "Gasto registrado y descontado del inventario.", variant: "success" });
      setCart([]);

      // Recargar stock visual
      if (ambulanceId && category) loadAmbulanceInventory(ambulanceId, category);

    } catch (error: any) {
      console.error("Error reportando gasto:", error);
      toast({ title: "Error", description: error.message || "Fallo al guardar.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AdaptiveContainer title="Registro de Gastos" subtitle="Control de consumo por paciente">
      <ToastContainer />

      {/* Panel Izquierdo */}
      <div className="w-full lg:w-1/2 p-4 sm:p-6 lg:p-8 space-y-6 bg-white flex flex-col">
        <div className="space-y-5 flex-1">

          {/* Aviso Info */}
          <div className="bg-blue-50 border border-blue-100 p-3 rounded-xl flex items-start gap-3">
            <div className="p-1.5 bg-blue-100 rounded-full text-blue-600 mt-0.5">
              <Truck className="w-4 h-4" />
            </div>
            <div className="text-xs sm:text-sm text-blue-800">
              <p className="font-semibold">Selecciona la Unidad</p>
              <p className="opacity-80">Se mostrarán solo insumos cargados en esa ambulancia.</p>
            </div>
          </div>

          <div>
            <Label>Unidad (Origen)</Label>
            <NativeSelect
              value={ambulanceId}
              onChange={handleAmbulanceChange}
              disabled={isHookLoading}
            >
              <option value="" disabled>Selecciona Ambulancia...</option>
              {ambulances.map((amb) => (
                <option key={amb.id} value={amb.id}>
                  🚑 Unidad {(amb as any).unit_id || (amb as any).unit_number || amb.id}
                </option>
              ))}
            </NativeSelect>
          </div>

          <div className="space-y-4">
            <div>
              <Label>Categoría</Label>
              <NativeSelect value={category} onChange={handleCategoryChange} disabled={!ambulanceId}>
                <option value="" disabled>Filtrar por tipo...</option>
                {categories.map((cat) => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </NativeSelect>
            </div>

            <div>
              <Label>Item a Gastar</Label>
              <NativeSelect
                value={selectedItemId}
                onChange={(e) => setSelectedItemId(e.target.value)}
                disabled={!category || itemList.length === 0}
              >
                {!ambulanceId ? <option value="">Primero elige unidad</option> :
                  !category ? <option value="">Elige categoría</option> :
                    itemList.length === 0 ? <option value="">Stock agotado</option> :
                      <option value="" disabled>Selecciona el insumo...</option>}

                {itemList.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.normalized_name} (Disp: {item.quantity})
                  </option>
                ))}
              </NativeSelect>
            </div>

            <div className="flex items-end gap-3 pt-2">
              <div className="w-1/3 sm:w-32">
                <Label>Cant. Usada</Label>
                <Input
                  type="number"
                  min={0}
                  max={currentItem?.quantity}
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
                  disabled={!selectedItemId}
                  placeholder="0"
                />
              </div>
              <div className="flex-1">
                <Button
                  type="button"
                  onClick={handleAddToUsageList}
                  disabled={!selectedItemId || quantity < 0}
                  variant="dark"
                >
                  <Minus className="w-5 h-5 mr-2" />
                  Registrar Gasto
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Panel Derecho: Lista de Consumo */}
      <div className="w-full lg:w-1/2 bg-orange-50/50 p-4 sm:p-6 lg:p-8 border-t lg:border-t-0 lg:border-l border-slate-200 flex flex-col h-[500px] lg:h-auto">
        <h3 className="text-lg font-bold text-slate-800 flex items-center mb-4 sm:mb-6">
          <div className="p-2 bg-orange-100 rounded-lg mr-3 text-orange-700">
            <ClipboardList className="w-5 h-5" />
          </div>
          Reporte de Consumo
          {cart.length > 0 && (
            <span className="ml-auto bg-orange-600 text-white text-xs px-2.5 py-1 rounded-full animate-in zoom-in">
              {cart.length}
            </span>
          )}
        </h3>

        <div className="flex-1 overflow-y-auto space-y-3 pr-1 mb-4 custom-scrollbar">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 border-2 border-dashed border-orange-200/50 rounded-2xl bg-white/50 p-6 text-center">
              <Box className="w-12 h-12 mb-3 opacity-20" />
              <p className="font-medium text-sm text-slate-500">Lista vacía</p>
              <p className="text-xs mt-1 opacity-60">Registra lo que usaste en el paciente</p>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.id} className="bg-white p-3 sm:p-4 rounded-xl shadow-sm border border-orange-100 flex justify-between items-center group hover:border-orange-300 transition-colors">
                <div className="overflow-hidden mr-3">
                  <div className="font-bold text-slate-800 text-sm truncate">{item.name}</div>
                  <div className="text-xs text-slate-500 mt-1 flex flex-wrap items-center gap-2">
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide bg-orange-50 text-orange-700">
                      Gasto
                    </span>
                    <span className="whitespace-nowrap">Cant: <b className="text-red-600">{item.quantity}</b></span>
                  </div>
                </div>
                <button
                  onClick={() => removeFromCart(item.id)}
                  className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all flex-shrink-0"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>

        <div className="mt-auto pt-4 border-t border-orange-200/50 bg-orange-50/50 sticky bottom-0">
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm font-medium text-slate-500">Items a descontar</span>
            <span className="text-2xl font-black text-slate-800">
              {cart.reduce((acc, item) => acc + item.quantity, 0)}
            </span>
          </div>
          <Button
            onClick={handleConfirmUsage}
            disabled={isSubmitting || cart.length === 0}
            variant="primary"
            className={isSubmitting ? "opacity-80 cursor-wait" : ""}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Procesando...
              </>
            ) : (
              <>
                Confirmar Consumo
                <CheckCircle className="w-5 h-5 ml-2 opacity-60" />
              </>
            )}
          </Button>
        </div>
      </div>
    </AdaptiveContainer>
  );
};

export default EquipamentUsagePage;