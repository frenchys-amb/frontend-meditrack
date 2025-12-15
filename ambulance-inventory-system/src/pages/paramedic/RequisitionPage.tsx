import React, { useState, useCallback, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Plus, Trash2, ShoppingCart, ChevronDown, Zap, CheckCircle, AlertTriangle, Loader2, Box, Truck } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useAmbulances } from '@/hooks/useAmbulances';

// TIPOS
interface Item {
  id: string;
  normalized_name: string;
  quantity: number;
  category: string;
}

interface CartItem {
  id: string;
  name: string;
  quantity: number;
  category: string; // 🔥 Ahora guardamos la categoría original
  maxQuantity: number;
}

// CONFIG
const TABLE_MEDICATION = 'storage_medications';
const TABLE_EQUIPMENT = 'storage_equipment';

// 🔥 CATEGORÍAS QUE SON MEDICAMENTOS
const MEDICATION_CATEGORIES = ['medicamentos', 'medicamento'];

const categories = [
  { value: "medicamento", label: "💊 Medicamentos (Farmacia)" },
  { value: "Inmovilización", label: "🦴 Inmovilización" },
  { value: "oxigeno_airway", label: "💨 Oxígeno/Airway" },
  { value: "canalizacion", label: "💉 Canalización" },
  { value: "miscelaneos", label: "🔧 Misceláneos" },
  { value: "entubacion", label: "🫁 Entubación" },
  { value: "equipo", label: "📦 Equipo General" },
];

// UI COMPONENTS
const AdaptiveContainer: React.FC<{ children: React.ReactNode, title: string, subtitle: string }> = ({ children, title, subtitle }) => (
  <div className="min-h-screen bg-slate-50 flex flex-col items-center py-4 sm:py-8 px-3 sm:px-6 font-sans">
    <div className="w-full max-w-6xl">
      <div className="mb-6 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">{title}</h1>
          <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
        </div>
      </div>
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden flex flex-col lg:flex-row">
        {children}
      </div>
    </div>
  </div>
);

const Label: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <label className="block text-xs sm:text-sm font-bold text-slate-700 mb-1.5 ml-1 uppercase tracking-wide opacity-80">{children}</label>
);

const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = (props) => (
  <input {...props} className="w-full p-3 text-sm sm:text-base border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none disabled:opacity-60" />
);

const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'dark' }> = ({ children, className, variant = 'primary', ...props }) => {
  const baseStyle = "w-full flex items-center justify-center px-4 py-3.5 sm:py-3 text-sm sm:text-base font-bold rounded-xl shadow-sm transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation";
  const variants = {
    primary: "border-transparent text-white bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200",
    secondary: "border-slate-200 text-slate-700 bg-white hover:bg-slate-50",
    dark: "border-transparent text-white bg-slate-900 hover:bg-slate-800 shadow-slate-300"
  };
  return <button {...props} className={`${baseStyle} ${variants[variant]} ${className}`}>{children}</button>;
};

const NativeSelect: React.FC<{ value: string, onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void, disabled?: boolean, children: React.ReactNode }> = ({ value, onChange, disabled, children }) => (
  <div className="relative w-full group">
    <select value={value} onChange={onChange} disabled={disabled} className="w-full p-3 pl-3 pr-10 text-sm sm:text-base border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all appearance-none cursor-pointer outline-none disabled:bg-slate-100 disabled:text-slate-400 truncate">
      {children}
    </select>
    <div className="absolute inset-y-0 right-0 flex items-center px-3 text-slate-400 pointer-events-none">
      <ChevronDown className="h-4 w-4 sm:h-5 sm:w-5" />
    </div>
  </div>
);

// HOOK DE TOAST
const useToast = () => {
  const [toasts, setToasts] = useState<any[]>([]);

  const toast = ({ title, description, variant }: { title: string, description: string, variant: 'default' | 'destructive' | 'success' }) => {
    const id = Date.now() + Math.random();
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
            <Icon className={`h-5 w-5 mt-0.5 flex-shrink-0 ${t.variant === 'destructive' ? 'text-red-600' : t.variant === 'success' ? 'text-emerald-600' : 'text-indigo-600'}`} />
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

// 🔥 FUNCIÓN HELPER: Determina si es medicamento
const isMedication = (category: string): boolean => {
  return MEDICATION_CATEGORIES.includes(category.toLowerCase());
};

// COMPONENTE PRINCIPAL
const EquipmentRequisition = () => {
  const { toast, ToastContainer } = useToast();
  const { user } = useAuth();
  const location = useLocation();

  const {
    ambulances,
    createManualRequisition,
    isLoading: isHookLoading
  } = useAmbulances();

  const [ambulanceId, setAmbulanceId] = useState("");
  const [category, setCategory] = useState<string>("");
  const [itemList, setItemList] = useState<Item[]>([]);
  const [selectedItemId, setSelectedItemId] = useState<string>("");
  const [quantity, setQuantity] = useState(1);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentItem = itemList.find((e) => e.id === selectedItemId);

  // 🔥 EFECTO DE CARGA AUTOMÁTICA CORREGIDO
  useEffect(() => {
    if (location.state?.preSelectedAmbulanceId) {
      setAmbulanceId(location.state.preSelectedAmbulanceId);
    }

    if (location.state?.preFillItems && Array.isArray(location.state.preFillItems)) {
      const importedItems = location.state.preFillItems.map((item: any) => ({
        id: "auto-" + Math.random().toString(36).substr(2, 9),
        name: item.name,
        quantity: item.quantity,
        category: item.category, // 🔥 Ahora guardamos la categoría original
        maxQuantity: 9999
      }));
      setCart(importedItems);

      const medCount = importedItems.filter((i: CartItem) => isMedication(i.category)).length;
      const eqCount = importedItems.length - medCount;

      toast({
        title: "✅ Datos Importados",
        description: `Cargados: ${medCount} medicamentos y ${eqCount} equipos`,
        variant: "success"
      });
    }
  }, [location]);

  const loadItems = useCallback(async (selectedCat: string) => {
    if (!selectedCat) return;
    setSelectedItemId("");
    setQuantity(1);
    setItemList([]);

    let query;
    if (selectedCat === "medicamento") {
      query = supabase.from(TABLE_MEDICATION).select("*").gt("quantity", 0).order("normalized_name");
    } else {
      query = supabase.from(TABLE_EQUIPMENT).select("*").eq("category", selectedCat).gt("quantity", 0).order("normalized_name");
    }

    const { data, error } = await query;
    if (error) {
      toast({ title: "Error", description: "No se pudo cargar el inventario.", variant: "destructive" });
    } else {
      setItemList(data as Item[] || []);
      if (data?.length === 0) toast({ title: "Sin Stock", description: "Categoría vacía.", variant: "default" });
    }
  }, []);

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCat = e.target.value;
    setCategory(newCat);
    loadItems(newCat);
  };

  const handleAddToCart = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentItem) return;
    if (quantity < 1) return toast({ title: "Error", description: "Cantidad inválida.", variant: "destructive" });
    if (quantity > currentItem.quantity) return toast({ title: "Stock Insuficiente", description: `Solo hay ${currentItem.quantity}.`, variant: "destructive" });

    const existingItemIndex = cart.findIndex(item => item.id === currentItem.id);

    if (existingItemIndex >= 0) {
      const newCart = [...cart];
      const newTotal = newCart[existingItemIndex].quantity + quantity;
      if (newTotal > currentItem.quantity) return toast({ title: "Límite", description: "Excede stock.", variant: "destructive" });
      newCart[existingItemIndex].quantity = newTotal;
      setCart(newCart);
    } else {
      setCart([...cart, {
        id: currentItem.id,
        name: currentItem.normalized_name,
        quantity: quantity,
        maxQuantity: currentItem.quantity,
        category: category // 🔥 Guardamos la categoría seleccionada
      }]);
    }
    setQuantity(1);
    toast({ title: "Agregado", description: `${currentItem.normalized_name} añadido.`, variant: "success" });
  };

  const removeFromCart = (id: string) => setCart(cart.filter(item => item.id !== id));

  // 🔥 FUNCIÓN CORREGIDA: Ahora envía el formato correcto
  const handleConfirmTransfer = async () => {
    if (!user) return toast({ title: "Sesión", description: "Inicia sesión.", variant: "destructive" });
    if (!ambulanceId) return toast({ title: "Falta Ambulancia", description: "Selecciona destino.", variant: "destructive" });
    if (cart.length === 0) return toast({ title: "Carrito Vacío", description: "Añade items primero.", variant: "destructive" });

    setIsSubmitting(true);
    try {
      // 🔥 PAYLOAD CORREGIDO: Determinamos el tipo según la categoría
      const itemsPayload = cart.map(item => ({
        name: item.name,
        missing_qty: item.quantity,
        type: isMedication(item.category) ? 'medications' : 'equipment', // 🔥 CRÍTICO
        section: item.category
      }));

      console.log('📦 Payload enviado al trigger:', itemsPayload);

      const date = new Date().toISOString().split('T')[0];
      await createManualRequisition(ambulanceId, date, itemsPayload);

      const medCount = cart.filter(i => isMedication(i.category)).length;
      const eqCount = cart.length - medCount;

      toast({
        title: "✅ Transferencia Exitosa",
        description: `Transferidos: ${medCount} medicamentos y ${eqCount} equipos`,
        variant: "success"
      });

      setCart([]);
      setQuantity(1);
      if (category) loadItems(category);

    } catch (error: any) {
      console.error('❌ Error en transferencia:', error);
      toast({
        title: "Error en Transferencia",
        description: error.message || "Fallo al procesar.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AdaptiveContainer title="Requisición de Equipo" subtitle="Abastecimiento de Ambulancias">
      <ToastContainer />
      <div className="w-full lg:w-1/2 p-4 sm:p-6 lg:p-8 space-y-6 bg-white flex flex-col">
        <div className="space-y-5 flex-1">
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
            <Label>Unidad Destino</Label>
            <NativeSelect value={ambulanceId} onChange={(e) => setAmbulanceId(e.target.value)} disabled={isHookLoading}>
              <option value="" disabled>Selecciona Unidad...</option>
              {ambulances.map((amb) => (
                <option key={amb.id} value={amb.id}>🚑 Unidad {(amb as any).unit_id || (amb as any).plate_number}</option>
              ))}
            </NativeSelect>
          </div>
          <div className="space-y-4">
            <div>
              <Label>Categoría</Label>
              <NativeSelect value={category} onChange={handleCategoryChange}>
                <option value="" disabled>Filtrar por tipo...</option>
                {categories.map((cat) => <option key={cat.value} value={cat.value}>{cat.label}</option>)}
              </NativeSelect>
            </div>
            <div>
              <Label>Insumo Disponible</Label>
              <NativeSelect value={selectedItemId} onChange={(e) => setSelectedItemId(e.target.value)} disabled={!category || itemList.length === 0}>
                {!category ? <option value="">Primero elige categoría</option> : itemList.length === 0 ? <option value="">Vacía</option> : <option value="" disabled>Selecciona...</option>}
                {itemList.map((item) => <option key={item.id} value={item.id}>{item.normalized_name} — (Stock: {item.quantity})</option>)}
              </NativeSelect>
            </div>
            <div className="flex items-end gap-3 pt-2">
              <div className="w-1/3 sm:w-32">
                <Label>Cant.</Label>
                <Input type="number" min={1} max={currentItem?.quantity} value={quantity} onChange={(e) => setQuantity(parseInt(e.target.value) || 0)} disabled={!selectedItemId} />
              </div>
              <div className="flex-1">
                <Button type="button" onClick={handleAddToCart} disabled={!selectedItemId || quantity < 1} variant="dark"><Plus className="w-5 h-5 mr-2" />Agregar</Button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="w-full lg:w-1/2 bg-slate-50 p-4 sm:p-6 lg:p-8 border-t lg:border-t-0 lg:border-l border-slate-200 flex flex-col h-[500px] lg:h-auto">
        <h3 className="text-lg font-bold text-slate-800 flex items-center mb-4"><div className="p-2 bg-indigo-100 rounded-lg mr-3 text-indigo-700"><ShoppingCart className="w-5 h-5" /></div>Lista de Transferencia</h3>
        <div className="flex-1 overflow-y-auto space-y-3 pr-1 mb-4 custom-scrollbar">
          {cart.length === 0 ? <div className="h-full flex flex-col items-center justify-center text-slate-400 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-100/50 p-6 text-center"><Box className="w-12 h-12 mb-3 opacity-20" /><p className="font-medium text-sm text-slate-500">Lista vacía</p></div> :
            cart.map((item) => {
              const isMed = isMedication(item.category);
              return (
                <div key={item.id} className="bg-white p-3 rounded-xl shadow-sm border border-slate-200 flex justify-between items-center">
                  <div className="overflow-hidden mr-3">
                    <div className="font-bold text-slate-800 text-sm truncate">{item.name}</div>
                    <div className="text-xs text-slate-500 mt-1 flex gap-2">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${isMed ? 'bg-blue-50 text-blue-700' : 'bg-orange-50 text-orange-700'}`}>
                        {isMed ? '💊 MED' : '📦 EQP'}
                      </span>
                      <span>Cant: <b>{item.quantity}</b></span>
                      <span className="text-[10px] opacity-60">{item.category}</span>
                    </div>
                  </div>
                  <button onClick={() => removeFromCart(item.id)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                </div>
              );
            })}
        </div>
        <div className="mt-auto pt-4 border-t border-slate-200 bg-slate-50 sticky bottom-0">
          <div className="flex justify-between items-center mb-4"><span className="text-sm font-medium text-slate-500">Total Items</span><span className="text-2xl font-black text-slate-800">{cart.reduce((acc, item) => acc + item.quantity, 0)}</span></div>
          <Button onClick={handleConfirmTransfer} disabled={isSubmitting || cart.length === 0} variant="primary">{isSubmitting ? <><Loader2 className="w-5 h-5 mr-2 animate-spin" />Procesando...</> : <><Truck className="w-5 h-5 mr-2" />Confirmar Requisición</>}</Button>
        </div>
      </div>
    </AdaptiveContainer>
  );
};

export default EquipmentRequisition;