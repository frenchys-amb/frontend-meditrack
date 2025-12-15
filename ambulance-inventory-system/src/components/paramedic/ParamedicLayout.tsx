import React from 'react';
import { Link, useNavigate, useLocation, Outlet } from 'react-router-dom';
import {
  ClipboardList,
  Package,
  Truck,
  LogOut,
  HeartPulse,
  Activity,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '../ui/button';

// --- CONFIGURACIÓN DEL MENÚ ---
const navItems = [
  {
    name: 'Hoja de Chequeo',
    description: 'Revisión diaria de unidad',
    href: '/paramedic/checklist',
    icon: ClipboardList,
    gradient: 'from-blue-500 to-indigo-600',
    lightGradient: 'from-blue-50 to-indigo-50',
    iconColor: 'text-blue-600',
    hoverBg: 'hover:bg-blue-50',
    activeBorder: 'border-blue-500'
  },
  {
    name: 'Requisición',
    description: 'Solicitar nuevos insumos',
    href: '/paramedic/requisition',
    icon: Truck,
    gradient: 'from-emerald-500 to-green-600',
    lightGradient: 'from-emerald-50 to-green-50',
    iconColor: 'text-emerald-600',
    hoverBg: 'hover:bg-emerald-50',
    activeBorder: 'border-emerald-500'
  },
  {
    name: 'Gastos de Equipo',
    description: 'Reportar uso en paciente',
    href: '/paramedic/equipment-usage',
    icon: Package,
    gradient: 'from-orange-500 to-amber-600',
    lightGradient: 'from-orange-50 to-amber-50',
    iconColor: 'text-orange-600',
    hoverBg: 'hover:bg-orange-50',
    activeBorder: 'border-orange-500'
  },
];

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Buenos días';
  if (hour < 19) return 'Buenas tardes';
  return 'Buenas noches';
};

const ParamedicLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const greeting = getGreeting();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-slate-50 font-sans">

      {/* === HEADER MEJORADO === */}
      <header className="sticky top-0 z-20 bg-white/90 backdrop-blur-xl border-b border-slate-200/50 shadow-lg shadow-slate-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-red-500 to-pink-600 rounded-xl blur opacity-30"></div>
                <div className="relative bg-gradient-to-br from-red-500 to-pink-600 p-2.5 rounded-xl shadow-lg shadow-red-200">
                  <HeartPulse className="h-6 w-6 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-xl font-black text-slate-800 leading-tight tracking-tight">MediTrack</h1>
                <p className="text-xs text-slate-500 font-semibold">
                  {greeting}, <span className="text-indigo-600 font-bold">{user?.full_name?.split(' ')[0] ?? 'Paramédico'}</span>
                </p>
              </div>
            </div>

            <Button
              variant="ghost"
              onClick={handleLogout}
              className="text-slate-500 hover:text-red-600 hover:bg-red-50 transition-all rounded-xl h-10 px-4 font-semibold"
            >
              <span className="hidden md:inline mr-2 text-sm">Salir</span>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* === CONTENIDO PRINCIPAL === */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-4 sm:p-6 lg:p-8 flex flex-col gap-6">

        {/* === BARRA DE NAVEGACIÓN (BOTONES COMPACTOS) === */}
        <nav className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {navItems.map((item) => {
            const isActive = location.pathname === item.href;
            const isDisabled = (item as any).disabled;

            return (
              <Link
                key={item.name}
                to={isDisabled ? '#' : item.href}
                onClick={(e) => isDisabled && e.preventDefault()}
                className={`
                  group relative overflow-hidden rounded-xl p-4 transition-all duration-300
                  border-2
                  ${isDisabled
                    ? 'bg-slate-50 border-slate-200 opacity-60 cursor-not-allowed grayscale'
                    : isActive
                      ? `border-slate-800 bg-gradient-to-br ${item.gradient} shadow-xl scale-[1.02]`
                      : `bg-white border-slate-200 ${item.hoverBg} hover:border-slate-300 hover:shadow-lg hover:-translate-y-0.5`
                  }
                `}
                style={isDisabled ? { pointerEvents: 'none' } : {}}
              >
                <div className="relative z-10 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {/* Ícono más pequeño */}
                    <div className={`
                      p-2 rounded-lg transition-all duration-300
                      ${isActive && !isDisabled
                        ? 'bg-white/20 text-white shadow-lg'
                        : `bg-gradient-to-br ${item.lightGradient} ${item.iconColor} group-hover:scale-110`
                      }
                    `}>
                      <item.icon className="h-5 w-5" />
                    </div>

                    {/* Textos compactos */}
                    <div>
                      <h3 className={`font-bold text-base ${isActive && !isDisabled ? 'text-white' : 'text-slate-800'}`}>
                        {item.name}
                        {isDisabled && (
                          <span className="ml-2 text-[10px] bg-slate-200 text-slate-500 px-2 py-0.5 rounded-full font-semibold">
                            Bloqueado
                          </span>
                        )}
                      </h3>
                      <p className={`text-xs font-medium ${isActive && !isDisabled ? 'text-white/90' : 'text-slate-500'}`}>
                        {item.description}
                      </p>
                    </div>
                  </div>

                  {/* Indicador de navegación */}
                  {!isDisabled && (
                    <div className={`
                      p-1 rounded-lg transition-all duration-300
                      ${isActive
                        ? 'bg-white/20 text-white translate-x-0'
                        : 'text-slate-300 group-hover:text-slate-600 group-hover:translate-x-1 group-hover:bg-slate-100'
                      }
                    `}>
                      <ChevronRight className="h-4 w-4" />
                    </div>
                  )}
                </div>

                {/* Indicador visual activo (barra inferior) */}
                {isActive && !isDisabled && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/40 rounded-t-full"></div>
                )}
              </Link>
            );
          })}
        </nav>

        {/* === ÁREA DEL FORMULARIO (OUTLET) === */}
        <section className="flex-1 bg-white/80 backdrop-blur-sm rounded-3xl border border-slate-200/50 shadow-xl shadow-slate-200/50 overflow-hidden min-h-[500px]">
          {/* Barra superior decorativa más sutil */}
          <div className="h-1 w-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500"></div>

          <div className="p-6 md:p-8">
            {location.pathname === '/paramedic' && (
              <div className="flex flex-col items-center justify-center h-64 text-center">
                <div className="relative mb-6">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl blur-xl opacity-20"></div>
                  <div className="relative p-6 bg-gradient-to-br from-slate-50 to-blue-50 rounded-2xl">
                    <Activity className="h-16 w-16 text-slate-300" />
                  </div>
                </div>
                <p className="text-lg font-bold text-slate-600 mb-2">¡Bienvenido al Panel de Control!</p>
                <p className="text-sm text-slate-400 font-medium">Selecciona una opción arriba para comenzar tu jornada.</p>
              </div>
            )}

            <Outlet />
          </div>
        </section>

      </main>

      {/* === FOOTER MINIMALISTA === */}
      <footer className="py-4 text-center">
        <p className="text-xs text-slate-400 font-medium">
          MediTrack © 2024 · Sistema de Gestión Médica
        </p>
      </footer>
    </div>
  );
};

export default ParamedicLayout;