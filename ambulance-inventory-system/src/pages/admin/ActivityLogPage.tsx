import React, { useState, useMemo } from "react";
import { useActivityLog } from "@/hooks/useActivityLog";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Clock,
  User,
  Activity,
  X,
  ShieldCheck,
  Archive,
  FileJson,
  Loader2,
  Terminal,
  TrendingUp,
  Clock3 // Icono ligeramente diferente para el timestamp
} from "lucide-react";

// Componentes de tabla simples (Sin cambios)
const Table = ({ children, ...props }: any) => (
  <table className="w-full" {...props}>{children}</table>
);
const TableHeader = ({ children, className = "", ...props }: any) => (
  <thead className={className} {...props}>{children}</thead>
);
const TableBody = ({ children, ...props }: any) => (
  <tbody {...props}>{children}</tbody>
);
const TableRow = ({ children, className = "", ...props }: any) => (
  <tr className={className} {...props}>{children}</tr>
);
const TableHead = ({ children, className = "", ...props }: any) => (
  <th className={`text-left px-4 ${className}`} {...props}>{children}</th>
);
const TableCell = ({ children, className = "", ...props }: any) => (
  <td className={`px-4 ${className}`} {...props}>{children}</td>
);

const ActivityLogPage: React.FC = () => {
  const { activities, isLoading } = useActivityLog({ fetchOnMount: true });
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    return activities.filter((log: any) => {
      const userName = log.users?.full_name || "";
      const detailsTxt = JSON.stringify(log.details ?? "").toLowerCase();
      const txt = `${log.action} ${log.entity_type} ${userName} ${detailsTxt}`.toLowerCase();
      return txt.includes(search.toLowerCase());
    });
  }, [activities, search]);

  const getActionBadge = (action: string) => {
    const act = action.toLowerCase();
    let styles = "bg-slate-100 text-slate-700 border-slate-200";

    if (act.includes("create") || act.includes("add") || act.includes("insert")) {
      styles = "bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-700 border-emerald-200";
    } else if (act.includes("delete") || act.includes("remove")) {
      styles = "bg-gradient-to-r from-rose-100 to-red-100 text-rose-700 border-rose-200";
    } else if (act.includes("update") || act.includes("edit")) {
      styles = "bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 border-blue-200";
    } else if (act.includes("login") || act.includes("auth")) {
      styles = "bg-gradient-to-r from-violet-100 to-purple-100 text-violet-700 border-violet-200";
    }

    return (
      <Badge className={`px-3 py-1.5 rounded-full border font-bold text-[10px] uppercase tracking-wider shadow-sm transition-all ${styles}`}>
        {action.replace(/_/g, " ")}
      </Badge>
    );
  };

  const renderDetails = (details: any) => {
    if (!details || Object.keys(details).length === 0) {
      return <span className="text-slate-300 text-xs font-medium">-</span>;
    }

    const detailEntries = Object.entries(details).filter(([key, value]) =>
      value !== null && value !== "" && key !== "id" && key !== "user_id"
    );

    if (detailEntries.length === 0) return <span className="text-slate-300 text-xs">-</span>;

    const displayEntries = detailEntries.slice(0, 3);
    const remainingCount = detailEntries.length - displayEntries.length;

    return (
      // Contenedor más compacto y profesional
      <div className="bg-white border border-slate-200 rounded-xl p-3 max-w-xs group hover:border-indigo-400 hover:shadow-md transition-all duration-300">
        {displayEntries.map(([key, value]) => (
          <div key={key} className="flex text-[11px] leading-snug font-mono mb-1 last:mb-0">
            <span className="text-slate-500 font-semibold mr-2 flex-shrink-0 min-w-[50px]">
              {key}:
            </span>
            <span className="text-slate-800 truncate font-bold" title={String(value)}>
              {String(value)}
            </span>
          </div>
        ))}
        {remainingCount > 0 && (
          <div className="text-[10px] text-indigo-700 font-bold mt-2 pt-2 border-t border-slate-100 flex items-center gap-1">
            <Terminal className="h-3 w-3" />
            +{remainingCount} datos
          </div>
        )}
      </div>
    );
  };

  const uniqueUsers = useMemo(() => new Set(activities.map((a: any) => a.user_id)).size, [activities]);
  const lastActivity = useMemo(() => activities[0]?.created_at ? new Date(activities[0].created_at) : null, [activities]);

  const lastTime = lastActivity?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
  const lastDate = lastActivity?.toLocaleDateString("es-ES", { year: 'numeric', month: 'short', day: 'numeric' });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-slate-50 via-indigo-50/20 to-slate-50">
        <div className="relative">
          <div className="absolute inset-0 bg-indigo-500 rounded-full opacity-20 animate-ping"></div>
          <Loader2 className="h-14 w-14 text-indigo-600 animate-spin relative z-10" />
        </div>
        <p className="text-lg font-bold text-slate-600 mt-6">Sincronizando registros...</p>
        <p className="text-sm text-slate-400 mt-1">Obteniendo historial de actividad</p>
      </div>
    );
  }

  return (
    // Fondo más contrastante
    <div className="w-full min-h-screen bg-gradient-to-br from-gray-100 via-white to-gray-100 p-6 md:p-12 font-sans text-slate-900">
      <main className="max-w-7xl mx-auto space-y-8">

        {/* HEADER MEJORADO */}
        <header className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-3xl blur-3xl opacity-60"></div>
          <div className="relative bg-white/95 backdrop-blur-md rounded-3xl border border-slate-200/70 shadow-2xl shadow-slate-300/50 p-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-start gap-4">
                <div className="p-4 bg-gradient-to-br from-indigo-600 to-fuchsia-600 rounded-2xl shadow-xl shadow-indigo-500/40">
                  <ShieldCheck className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight bg-gradient-to-r from-indigo-600 to-fuchsia-600 bg-clip-text text-transparent">
                    Auditoría del Sistema
                  </h1>
                  <p className="text-slate-500 mt-2 text-base font-medium">
                    Traza de seguridad y movimientos clave en tiempo real
                  </p>
                  <div className="flex items-center gap-2 mt-3">
                    <div className="flex items-center gap-1.5 bg-emerald-100 px-3 py-1 rounded-full border border-emerald-200">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
                      </span>
                      <span className="text-xs font-bold text-emerald-800 uppercase tracking-wide">Sistema Activo</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* KPI CARDS MEJORADAS */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {/* Card 1: Registros Totales */}
          <Card className="group bg-gradient-to-br from-indigo-50 to-blue-50 rounded-3xl border border-slate-200/70 p-1 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5">
            <div className="relative bg-white rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-gradient-to-br from-indigo-600 to-blue-700 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/40">
                  <Activity className="h-6 w-6" />
                </div>
                <TrendingUp className="h-5 w-5 text-indigo-400 opacity-50 group-hover:opacity-100 transition-opacity" />
              </div>
              {/* Valor clave más grande y audaz */}
              <p className="text-5xl font-extrabold text-slate-900 bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
                {activities.length.toLocaleString()}
              </p>
              <p className="text-xs text-slate-500 font-bold uppercase mt-2 tracking-widest">Registros Totales</p>
            </div>
          </Card>

          {/* Card 2: Usuarios Activos */}
          <Card className="group bg-gradient-to-br from-emerald-50 to-green-50 rounded-3xl border border-slate-200/70 p-1 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5">
            <div className="relative bg-white rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-gradient-to-br from-emerald-600 to-green-700 rounded-xl flex items-center justify-center text-white shadow-lg shadow-emerald-500/40">
                  <User className="h-6 w-6" />
                </div>
                <TrendingUp className="h-5 w-5 text-emerald-400 opacity-50 group-hover:opacity-100 transition-opacity" />
              </div>
              {/* Valor clave más grande y audaz */}
              <p className="text-5xl font-extrabold text-slate-900 bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
                {uniqueUsers.toLocaleString()}
              </p>
              <p className="text-xs text-slate-500 font-bold uppercase mt-2 tracking-widest">Usuarios Únicos</p>
            </div>
          </Card>

          {/* Card 3: Última Actividad */}
          <Card className="group bg-gradient-to-br from-amber-50 to-orange-50 rounded-3xl border border-slate-200/70 p-1 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5">
            <div className="relative bg-white rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-gradient-to-br from-amber-600 to-orange-700 rounded-xl flex items-center justify-center text-white shadow-lg shadow-amber-500/40">
                  <Clock className="h-6 w-6" />
                </div>
                <Badge className="text-[10px] font-bold text-amber-800 bg-amber-100 border border-amber-300 px-3 py-1 rounded-full uppercase tracking-wider">
                  Reciente
                </Badge>
              </div>
              {/* Valor clave más grande y audaz */}
              <p className="text-5xl font-extrabold text-slate-900 bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                {lastTime || "--:--"}
              </p>
              <p className="text-xs text-slate-500 font-bold uppercase mt-2 tracking-widest">
                {lastDate || "Sin eventos recientes"}
              </p>
            </div>
          </Card>
        </div>

        {/* TABLA PRINCIPAL */}
        <Card className="group border border-slate-200/70 shadow-2xl shadow-slate-300/50 bg-white/95 backdrop-blur-md rounded-3xl overflow-hidden hover:shadow-3xl transition-all duration-500">
          <div className="p-6 border-b border-slate-200/70 bg-gradient-to-br from-white to-indigo-50/50">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-1 h-8 bg-gradient-to-b from-indigo-600 to-purple-600 rounded-full"></div>
                <h2 className="text-2xl font-extrabold text-slate-900">Historial de Eventos</h2>
                <Badge className="text-slate-700 bg-white border-slate-300 font-bold px-3 py-1 text-sm rounded-xl shadow-md">
                  {filtered.length} Registros
                </Badge>
              </div>

              <div className="relative w-full sm:w-96 group">
                <Input
                  className="pl-12 pr-10 h-11 bg-white border-slate-300 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all text-sm rounded-xl font-medium shadow-md"
                  placeholder="Filtrar por usuario, acción o detalles..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                {search && (
                  <button
                    onClick={() => setSearch('')}
                    className="absolute inset-y-0 right-3 flex items-center hover:bg-slate-100 rounded-lg px-1 transition-colors"
                  >
                    <X className="h-4 w-4 text-slate-500 hover:text-slate-700" />
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <Table>
              {/* Encabezado más audaz y legible */}
              <TableHeader className="bg-slate-900 sticky top-0 z-10">
                <TableRow className="border-none">
                  <TableHead className="w-[200px] pl-8 h-12 text-[10px] uppercase tracking-widest font-extrabold text-white">USUARIO / ID</TableHead>
                  <TableHead className="w-[150px] h-12 text-[10px] uppercase tracking-widest font-extrabold text-white">ACCIÓN</TableHead>
                  <TableHead className="w-[120px] h-12 text-[10px] uppercase tracking-widest font-extrabold text-white">ENTIDAD</TableHead>
                  <TableHead className="h-12 text-[10px] uppercase tracking-widest font-extrabold text-white">DETALLES</TableHead>
                  <TableHead className="w-[150px] pr-8 h-12 text-right text-[10px] uppercase tracking-widest font-extrabold text-white">TIMESTAMP</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-80 text-center">
                      <div className="flex flex-col items-center justify-center py-12">
                        <div className="p-6 bg-slate-50 rounded-2xl mb-4">
                          <Archive className="h-16 w-16 text-slate-300" />
                        </div>
                        <p className="text-slate-600 font-bold text-lg">Sin resultados</p>
                        <p className="text-sm text-slate-400 mt-1">No se encontraron registros que coincidan</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((log: any, index: number) => (
                    <TableRow
                      key={log.id}
                      className="group border-b border-slate-100/70 hover:bg-indigo-50/30 transition-all duration-200"
                      style={{ animationDelay: `${index * 30}ms` }}
                    >
                      <TableCell className="pl-8 py-4 align-top">
                        <div className="flex items-start gap-3">
                          {/* Avatar más grande y estilizado */}
                          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-extrabold text-sm shadow-lg shadow-indigo-300 flex-shrink-0">
                            {(log.users?.full_name || "S").substring(0, 1).toUpperCase()}
                          </div>
                          <div className="flex flex-col pt-1">
                            <span className="text-sm font-bold text-slate-800 leading-snug">
                              {log.users?.full_name || "Usuario Sistema"}
                            </span>
                            <span className="text-[10px] text-slate-500 font-mono bg-slate-100 px-2 py-0.5 rounded-full w-fit border border-slate-200 mt-1">
                              ID: {log.user_id.slice(0, 6)}...
                            </span>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell className="align-top pt-5">
                        {getActionBadge(log.action)}
                      </TableCell>

                      <TableCell className="align-top pt-5">
                        <span className="text-xs font-extrabold text-indigo-800 bg-gradient-to-r from-indigo-100 to-purple-100 border border-indigo-200 px-3 py-1.5 rounded-full shadow-sm">
                          {log.entity_type}
                        </span>
                      </TableCell>

                      <TableCell className="py-4 align-top">
                        {renderDetails(log.details)}
                      </TableCell>

                      <TableCell className="text-right pr-8 align-top py-4">
                        <div className="flex flex-col items-end pt-1">
                          <span className="text-base font-extrabold text-slate-900 leading-snug">
                            {new Date(log.created_at).toLocaleTimeString("es-ES", { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          <div className="flex items-center gap-1 text-xs text-slate-500 font-medium mt-0.5">
                            <Clock3 className="h-3 w-3 text-indigo-400" />
                            {new Date(log.created_at).toLocaleDateString("es-ES", { day: '2-digit', month: 'short', year: 'numeric' })}
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          <div className="px-8 py-5 bg-slate-50 border-t border-slate-200/70 flex flex-col sm:flex-row justify-between items-center gap-4 rounded-b-3xl">
            <div className="flex items-center gap-2 text-sm text-slate-600 font-semibold">
              <FileJson className="h-4 w-4 text-indigo-600" />
              <span>
                Mostrando <span className="font-black text-indigo-700">{filtered.length}</span> de <span className="font-black text-slate-800">{activities.length}</span> eventos
              </span>
            </div>
            {/* Espacio para paginación futura */}
            <span className="text-xs text-slate-400">Datos proporcionados por el servicio de auditoría.</span>
          </div>
        </Card>
      </main>
    </div>
  );
};

export default ActivityLogPage;