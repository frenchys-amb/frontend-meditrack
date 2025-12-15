import React, { useState } from 'react';
import { LogOut, User, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { cn } from "@/lib/utils"; // Asegúrate de tener esta utilidad, o usa template strings normales

interface TopbarProps {
  title: string;
  className?: string; // Permitir clases extra si es necesario
}

const Topbar: React.FC<TopbarProps> = ({ title, className }) => {
  const { user, logout } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await logout();
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      setIsLoggingOut(false);
    }
  };

  return (
    <header 
      className={cn(
        // Posicionamiento
        "sticky top-0 z-30 w-full",
        // Estilos visuales
        "bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-200",
        "h-16 flex items-center justify-between px-6 transition-all duration-300",
        className
      )}
    >
      <div className="flex items-center gap-4">
        {/* Aquí podrías poner un botón de menú móvil si quisieras en el futuro */}
        <h1 className="text-xl font-semibold text-gray-800 tracking-tight">
          {title}
        </h1>
      </div>

      <div className="flex items-center space-x-4">
        <div className="flex flex-col items-end mr-2">
          <span className="text-sm font-medium text-gray-700 flex items-center">
            <User className="h-4 w-4 mr-2 text-blue-600" />
            {user?.full_name || user?.username || 'Usuario'}
          </span>
          <span className="text-xs text-gray-400">
             {user?.role === 'admin' ? 'Administrador' : 'Paramédico'}
          </span>
        </div>

        <div className="h-8 w-px bg-gray-200 mx-2" /> {/* Separador vertical */}

        <button
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="flex items-center text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 px-3 py-2 rounded-md transition-colors disabled:opacity-50"
        >
          {isLoggingOut ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              <LogOut className="h-4 w-4 mr-2" />
              Salir
            </>
          )}
        </button>
      </div>
    </header>
  );
};

export default Topbar;