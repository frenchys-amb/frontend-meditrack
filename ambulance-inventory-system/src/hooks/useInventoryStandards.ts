// este es de recomendacionespage
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface InventoryStandard {
  id: string;
  normalized_name: string;
  quantity: number;
  category: string;
}

export const useInventoryStandards = () => {
  const [items, setItems] = useState<InventoryStandard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchStandards = useCallback(async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('inventory_standards')
      .select('id, normalized_name, quantity, category')
      .order('normalized_name', { ascending: true });

    if (error) {
      console.error('Error cargando estándares:', error);
      toast({ title: "Error", description: "No se pudieron cargar los estándares.", variant: "destructive" });
    } else if (data) {
      setItems(data as InventoryStandard[]);
    }
    setIsLoading(false);
  }, [toast]);

  useEffect(() => {
    fetchStandards();
  }, [fetchStandards]);

  const updateStandard = async (id: string, newQuantity: number) => {
    const { error } = await supabase
      .from('inventory_standards')
      .update({ quantity: newQuantity })
      .eq('id', id);

    if (error) {
      throw new Error(error.message);
    }

    // Actualización optimista local
    setItems(prev => prev.map(item =>
      item.id === id ? { ...item, quantity: newQuantity } : item
    ));
  };

  const deleteStandard = async (id: string) => {
    const { error } = await supabase.from('inventory_standards').delete().eq('id', id);

    if (error) {
      throw new Error(error.message);
    }
    setItems(prev => prev.filter(item => item.id !== id));
  };

  return {
    items,
    isLoading,
    fetchStandards,
    updateStandard,
    deleteStandard
  };
};