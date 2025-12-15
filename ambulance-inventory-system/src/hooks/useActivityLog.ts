import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface ActivityLog {
  id: string;
  user_id: string;
  action: string;
  entity_type: string;
  entity_id: string | null;
  details: any;
  created_at: string;
  // This property name 'users' MUST match the alias used in the .select() query below.
  users?: {
    full_name: string;
    email: string;
  };
}

export const useActivityLog = ({ fetchOnMount = false } = {}) => {
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // --- KEPT THE DEBUGGING VERSION OF fetchActivities ---
  const fetchActivities = useCallback(async () => {
    setIsLoading(true);
    try {
      // Note: If your profile table is named 'profiles', you MUST use:
      // .select('*, users:profiles (full_name, email)') 
      // otherwise the JOIN will fail (and return error/null data).
      const { data, error } = await supabase
        .from('activity_log')
        .select(`*, users (full_name, email)`)
        .order('created_at', { ascending: false })
        .limit(50);

      // *** DEPURACIÓN / ERROR HANDLING ***
      if (error) {
        console.error('Error de Supabase (Revisa RLS y el JOIN):', error);
        setActivities([]); // Clear activities on error
        return;
      }

      console.log(`✅ Actividades cargadas. Total: ${data.length}`);
      // *** FIN DEPURACIÓN ***

      setActivities(data as ActivityLog[] || []);

    } catch (error: any) {
      console.error('Error fetching activities:', error.message);
    } finally {
      setIsLoading(false);
    }
  }, []); // Dependencias vacías para useCallback

  useEffect(() => {
    if (fetchOnMount) {
      fetchActivities();
    }
  }, [fetchOnMount, fetchActivities]); // fetchActivities included as dependency

  const logActivity = async (
    action: string,
    entityType: string,
    entityId: string | null,
    details: any
  ) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from('activity_log')
        .insert({
          user_id: user.id,
          action,
          entity_type: entityType,
          entity_id: entityId,
          details
        })
        .select()
        .single();

      if (error) throw error;

      if (fetchOnMount && data) {
        // Optimistic update
        const newLog: ActivityLog = {
          ...data as ActivityLog,
          users: { // Coincide con la interfaz
            full_name: user.user_metadata?.full_name || 'Yo',
            email: user.email || ''
          }
        };
        setActivities(prev => [newLog, ...prev]);
      }
      return data;
    } catch (error) {
      console.error('Log error:', error);
      return null;
    }
  };

  return { activities, isLoading, logActivity, fetchActivities };
};