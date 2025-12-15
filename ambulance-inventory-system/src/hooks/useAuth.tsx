import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
// Asegúrate de importar tu interfaz User correctamente, o usa 'any' temporalmente si falla
import { User } from '@/types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const auth = useProvideAuth();
  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe usarse dentro de un AuthProvider");
  }
  return context;
};

function useProvideAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    console.log("🔵 [Auth] Iniciando verificación de sesión...");
    let mounted = true;

    // --- MECANISMO DE SEGURIDAD (TIMEOUT) ---
    // Si por alguna razón Supabase no responde en 3 segundos, quitamos el loading a la fuerza.
    const timer = setTimeout(() => {
      if (isLoading && mounted) {
        console.warn("⚠️ [Auth] Tiempo de espera agotado. Forzando fin de carga.");
        setIsLoading(false);
      }
    }, 3000);

    const checkSession = async () => {
      try {
        // 1. Obtener sesión actual
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) {
          console.error("🔴 [Auth] Error obteniendo sesión:", sessionError);
          throw sessionError;
        }

        if (!session?.user) {
          console.log("⚪ [Auth] No hay sesión activa.");
          if (mounted) {
            setUser(null);
            setIsLoading(false);
          }
          return;
        }

        console.log("🟢 [Auth] Sesión encontrada para:", session.user.email);
        console.log("🔵 [Auth] Buscando perfil en tabla 'users'...");

        // 2. Obtener datos de la tabla 'users'
        const { data: profile, error: profileError } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (profileError) {
          console.error("🔴 [Auth] Error buscando perfil:", profileError.message);
          // Si el usuario existe en Auth pero no en la tabla, esto salta.
          // Lo tratamos como no logueado o logueado sin perfil.
        }

        if (mounted) {
          if (profile) {
            console.log("🟢 [Auth] Perfil cargado correctamente.");
            setUser(profile);
          } else {
            console.warn("⚠️ [Auth] Usuario autenticado pero sin datos en tabla 'users'");
            setUser(null);
          }
        }

      } catch (err) {
        console.error("🔴 [Auth] Error general:", err);
        if (mounted) setUser(null);
      } finally {
        // ESTA LÍNEA ES LA MÁS IMPORTANTE
        if (mounted) {
          console.log("🏁 [Auth] Finalizando estado de carga.");
          setIsLoading(false);
          clearTimeout(timer); // Limpiamos el timeout de seguridad
        }
      }
    };

    checkSession();

    // Suscripción a cambios
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (_event === 'SIGNED_OUT') {
        setUser(null);
        setIsLoading(false);
      }
    });

    return () => {
      mounted = false;
      clearTimeout(timer);
      subscription.unsubscribe();
    };
  }, []);

  // --- LOGIN ---
  const login = async (username: string, password: string) => {
    setIsLoading(true);
    try {
      // 1. Buscar email usando username
      const { data: userRecord, error: findError } = await supabase
        .from('users')
        .select('email')
        .eq('username', username)
        .single();

      if (findError || !userRecord) throw new Error('Usuario no encontrado');

      // 2. Autenticar con Supabase
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: userRecord.email,
        password,
      });

      if (authError) throw authError;

      // 3. Forzar recarga de página para asegurar estado limpio (opcional pero útil si hay bugs)
      // window.location.reload(); 

      // O simplemente refrescamos el perfil manualmente:
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const { data: profile } = await supabase.from('users').select('*').eq('id', session.user.id).single();
        setUser(profile);
      }

    } catch (err) {
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setIsLoading(false);
  };

  return { user, isAuthenticated: !!user, isLoading, login, logout };
}