import React, { useState } from "react";
import { Link } from "react-router-dom";

// Importaciones corregidas
import { Badge } from "@/components/ui/badge";
import { Truck, ArrowRight } from "lucide-react";

// Base data structure based on your database columns: id (uuid), unit_id (string)
const MOCKED_AMBULANCES_DATA = Array.from({ length: 16 }, (_, i) => {
  const unitNumber = i + 1;
  let unit_id;

  if (unitNumber === 2) {
    // Reemplazamos F2 por F17
    unit_id = 'F17';
  } else if (unitNumber > 2) {
    // Ajustamos la numeración después de F2 para que no haya duplicados si F17 ya existiera en el array original
    // NOTA: Si querías eliminar F2 y AÑADIR F17 al final, la lógica sería diferente.
    // Aquí asumimos que F2 es renombrado a F17.
    unit_id = `F${unitNumber}`;
  } else {
    unit_id = `F${unitNumber}`; // F1
  }

  return {
    id: `${unitNumber}`, // Simplified UUID for mock data
    unit_id: unit_id, // Unit Identifier
  };
});


const AmbulancesPage: React.FC = () => {
  // Usamos useState para mantener la lista
  const [ambulances] = useState(MOCKED_AMBULANCES_DATA);
  const totalCount = ambulances.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-slate-50 font-sans text-slate-900">

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-800"></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDEzNGg1MHY1MEgzNnoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-10"></div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 py-16">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 bg-indigo-500/20 backdrop-blur-sm px-4 py-2 rounded-full border border-indigo-400/30">
                <span className="text-xs font-bold text-indigo-200 uppercase tracking-wider">Gestión de Flota</span>
              </div>

              <h1 className="text-5xl md:text-6xl font-black text-white tracking-tight drop-shadow-lg">
                Flota de Ambulancias
              </h1>
              <p className="text-slate-300 text-base md:text-lg max-w-2xl leading-relaxed font-medium">
                Gestión operativa de todas las unidades móviles registradas en el sistema.
              </p>
            </div>

            {/* Stats Card */}
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 shadow-2xl p-6 min-w-[280px]">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 bg-indigo-500/20 rounded-xl">
                  <Truck className="h-6 w-6 text-indigo-400" />
                </div>
                <div>
                  <p className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">Unidades</p>
                  <p className="text-sm font-black text-white">Flota Total</p>
                </div>
              </div>

              <div className="space-y-3 pt-3 border-t border-white/10">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-300 font-semibold">Total Registrado</span>
                  <span className="text-xl font-black text-indigo-400">{totalCount}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-12 -mt-8 relative z-20">

        {/* Grid of units */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {ambulances.map((unit, index) => (
            <Link
              key={unit.id}
              // El enlace ahora usará F17 en lugar de F2 para esa unidad
              to={`/admin/ambulances/${unit.unit_id}`}
              className="group outline-none"
              style={{ animationDelay: `${index * 30}ms` }}
            >
              <article className={`
                relative bg-white rounded-2xl overflow-hidden border-2 shadow-lg
                transition-all duration-300 ease-out flex flex-col h-full
                hover:shadow-2xl hover:-translate-y-2
                border-slate-200 hover:border-indigo-400
              `}>
                {/* Header */}
                <div className="p-5 flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className={`
                      p-3 rounded-xl transition-all duration-300 shadow-md
                      bg-gradient-to-br from-slate-100 to-indigo-50 text-slate-600 group-hover:from-indigo-100 group-hover:to-indigo-200 group-hover:text-indigo-600 group-hover:shadow-lg group-hover:shadow-indigo-200
                    `}>
                      <Truck className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-black text-slate-800 group-hover:text-indigo-600 transition-colors">
                        {/* Muestra F17 si el unit_id es F17 */}
                        {unit.unit_id}
                      </h3>
                      <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Unidad</p>
                    </div>
                  </div>

                  <Badge className="border-indigo-200 bg-gradient-to-r from-indigo-100 to-blue-100 text-indigo-700 px-3 py-1 shadow-sm font-bold rounded-lg">
                    Registrada
                  </Badge>
                </div>

                {/* Content Area */}
                <div className="flex-1 px-5 pb-4">
                  <p className="text-sm text-slate-500">
                    Información general sobre la unidad, detalles de registro o ubicación.
                  </p>
                </div>

                {/* Footer con gradiente al hover */}
                <div className={`
                  mt-auto p-4 flex items-center justify-between border-t transition-all duration-300
                  bg-slate-50 border-slate-100 group-hover:bg-gradient-to-r group-hover:from-indigo-600 group-hover:to-purple-600
                `}>
                  <span className="text-xs font-bold text-slate-700 group-hover:text-white transition-colors uppercase tracking-wider">
                    Ver Detalles
                  </span>
                  <div className={`
                    p-2 rounded-full shadow-sm border transition-all duration-300
                    bg-white border-slate-200 text-slate-400 group-hover:bg-white/20 group-hover:border-white/40 group-hover:text-white group-hover:scale-110
                  `}>
                    <ArrowRight className="h-4 w-4" />
                  </div>
                </div>
              </article>
            </Link>
          ))}
        </section>
      </main>
    </div>
  );
};

export default AmbulancesPage;