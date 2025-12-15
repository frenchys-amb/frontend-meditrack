import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

import {
  LayoutDashboard,
  Package,
  Pill,
  Truck,
  Users,
  ClipboardList,
  BellRing,
} from "lucide-react";

const menu = [
  { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Equipos", href: "/admin/storage/equipment", icon: Package },
  { label: "Medicamentos", href: "/admin/storage/medications", icon: Pill },
  { label: "Ambulancias", href: "/admin/ambulances", icon: Truck },
  { label: "Usuarios", href: "/admin/users", icon: Users },
  { label: "Actividad", href: "/admin/activity-log", icon: ClipboardList },
  { label: "Recomendaciones", href: "/admin/recommended", icon: BellRing }
];

const Sidebar: React.FC = () => {
  const location = useLocation();
  const [isHovered, setIsHovered] = useState(false);

  return (
    <aside
      className={cn(
        // Posicionamiento y Estilos Base
        "fixed top-0 left-0 h-screen z-50",
        "bg-slate-900 border-r border-slate-800 shadow-2xl",
        "flex flex-col transition-all duration-300 ease-in-out",
        // Control del Ancho: w-20 (pequeño) vs w-64 (grande)
        isHovered ? "w-64" : "w-20"
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* HEADER / LOGO */}
      <div className="flex items-center h-20 px-4 border-b border-slate-800 overflow-hidden">
        <div className="flex items-center gap-3 min-w-max">
          <div className="shrink-0">
            <img
              src="/frenchy.png"
              alt="Logo"
              className="h-20 w-10 object-contain"
            />
          </div>

          {/* Texto del Header (se oculta al colapsar) */}
          <div
            className={cn(
              "transition-opacity duration-300",
              isHovered ? "opacity-100" : "opacity-0 hidden"
            )}
          >
            <h1 className="text-lg font-semibold text-white whitespace-nowrap">
              MediTrack
            </h1>
            <p className="text-xs text-slate-400 whitespace-nowrap">
              Panel de control
            </p>
          </div>
        </div>
      </div>

      {/* MENU */}
      <nav className="flex-1 py-6 px-3 space-y-2 overflow-y-auto overflow-x-hidden">
        {menu.map((item) => {
          const Icon = item.icon;
          const active = location.pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                "flex items-center rounded-lg transition-all duration-200 group relative",
                "h-12", // Altura fija para mantener consistencia
                active
                  ? "bg-blue-600 text-white shadow-md"
                  : "text-slate-400 hover:bg-slate-800 hover:text-white",
                // Si está colapsado, centramos el icono (justify-center). Si expandido, al inicio (justify-start)
                isHovered ? "px-4 justify-start" : "px-0 justify-center"
              )}
            >
              {/* Icono: Mantiene su tamaño fijo */}
              <Icon className="h-5 w-5 shrink-0" />

              {/* Texto del Menú */}
              <span
                className={cn(
                  "ml-3 text-sm font-medium whitespace-nowrap transition-all duration-300",
                  // Lógica para desvanecer el texto suavemente
                  isHovered
                    ? "opacity-100 translate-x-0 w-auto"
                    : "opacity-0 -translate-x-4 w-0 overflow-hidden"
                )}
              >
                {item.label}
              </span>

              {/* Tooltip opcional (aparece solo cuando está cerrado para saber qué es el icono) */}
              {!isHovered && (
                <div className="absolute left-14 z-50 rounded bg-slate-900 px-2 py-1 text-xs text-white opacity-0 shadow-md group-hover:opacity-100 pointer-events-none transition-opacity border border-slate-700 whitespace-nowrap">
                  {item.label}
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* FOOTER / USER INFO (Opcional) */}
      <div className="p-4 border-t border-slate-800">
        <div className="flex items-center gap-3 overflow-hidden">
          <div
            className={cn(
              "transition-all duration-300 whitespace-nowrap",
              isHovered ? "opacity-100 w-auto" : "opacity-0 w-0"
            )}
          >
            <p className="text-sm text-white">Derechos Reservados por MT... </p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;