import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "../common/Sidebar"; // Ajusta la ruta si Sidebar.tsx está en otra carpeta
import Topbar from "../common/Topbar";  // Ajusta la ruta si Topbar.tsx está en otra carpeta

const AdminLayout: React.FC = () => {
  const location = useLocation();

  // Función simple para determinar el título según la URL actual
  const getPageTitle = (path: string) => {
    if (path.includes("/dashboard")) return "Dashboard General";
    if (path.includes("/storage/equipment")) return "Inventario de Equipos";
    if (path.includes("/storage/medications")) return "Inventario de Medicamentos";
    if (path.includes("/ambulances")) return "Gestión de Ambulancias";
    if (path.includes("/users")) return "Gestión de Usuarios";
    if (path.includes("/activity-log")) return "Registro de Actividad";
    if (path.includes("/recommended")) return "Recomendaciones de Chequeo";
    return "Panel de Administración";
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* 1. SIDEBAR (Fijo a la izquierda) */}
      <Sidebar />

      {/* 2. CONTENEDOR PRINCIPAL 
          ml-20: Deja el hueco para el sidebar cerrado (5rem/80px)
          transition-all: Suaviza si el margen cambiara
      */}
      <div className="flex-1 ml-20 flex flex-col transition-all duration-300">
        
        {/* 3. TOPBAR (Sticky arriba) */}
        <Topbar title={getPageTitle(location.pathname)} />

        {/* 4. CONTENIDO DE LA PÁGINA (Outlet renderiza la ruta hija actual) */}
        <main className="p-6 md:p-8 w-full max-w-7xl mx-auto animate-in fade-in duration-500">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;