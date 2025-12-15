import { useState } from 'react';
import { Package, Edit, Trash2, Loader2, Target, TrendingUp, Search } from 'lucide-react'; // Añadido Search

// UI Components
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

// Custom Logic & Components
import { useInventoryStandards, InventoryStandard } from '@/hooks/useInventoryStandards';
import { EditStandardDialog } from '@/components/admin/modals/EditStandardDialog';

// Componentes de tabla simples (sin cambios)
const Table = ({ children, ...props }: any) => (
  <table className="w-full" {...props}>{children}</table>
);
const TableHeader = ({ children, ...props }: any) => (
  <thead {...props}>{children}</thead>
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

export default function RecommendedPage() {
  const { items, isLoading, updateStandard, deleteStandard } = useInventoryStandards();
  const { toast } = useToast();

  // Estados Locales de UI
  const [searchTerm, setSearchTerm] = useState('');
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryStandard | null>(null);

  // --- HANDLERS (No modificados) ---
  const handleEditClick = (item: InventoryStandard) => {
    setSelectedItem(item);
    setIsEditOpen(true);
  };

  const handleSaveWrapper = async (id: string, qty: number) => {
    try {
      await updateStandard(id, qty);
      toast({ title: "Actualizado ✅", description: "La meta de inventario se ha guardado." });
    } catch (error) {
      toast({ title: "Error", description: "No se pudo actualizar.", variant: "destructive" });
    }
  };

  const handleDeleteWrapper = async (id: string) => {
    if (!window.confirm('⚠️ ¿Confirmas la eliminación de este estándar?')) return;
    try {
      await deleteStandard(id);
      toast({ title: "Eliminado 🗑️", description: "El estándar ha sido removido." });
    } catch (error) {
      toast({ title: "Error", description: "No se pudo eliminar.", variant: "destructive" });
    }
  };

  // Filtro de búsqueda
  const filteredItems = items.filter(item =>
    item.normalized_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    // Fondo más neutro para que las tarjetas resalten más
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 p-6 lg:p-10">

      {/* --- HEADER MEJORADO --- */}
      <div className="max-w-6xl mx-auto mb-8">
        <div className="relative">
          {/* Fondo difuminado más potente */}
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 rounded-3xl blur-3xl opacity-60"></div>

          <div className="relative bg-white/95 backdrop-blur-md rounded-3xl border border-slate-200/70 shadow-2xl shadow-slate-300/60 p-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-start gap-4">
                <div className="p-4 bg-gradient-to-br from-emerald-600 to-teal-700 rounded-2xl shadow-xl shadow-emerald-500/50">
                  <Target className="h-8 w-8 text-white" />
                </div>
                <div>
                  {/* Título con gradiente más profundo y fuente más audaz */}
                  <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight bg-gradient-to-r from-emerald-600 to-teal-700 bg-clip-text text-transparent">
                    Estándares de Inventario
                  </h1>
                  <p className="text-slate-500 font-medium mt-2">
                    Configuración de metas (Stock Ideal) por ambulancia
                  </p>
                  <div className="flex items-center gap-2 mt-3">
                    {/* Badge más contrastante */}
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

              {/* Tarjeta de Contador más estilizada */}
              <div className="group bg-gradient-to-br from-emerald-500/10 to-teal-500/10 p-0.5 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="bg-white px-6 py-4 rounded-2xl flex items-center gap-4 border border-white">
                  <div className="p-3 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-xl shadow-xl shadow-emerald-500/40">
                    <Package className="text-white w-6 h-6" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase font-black text-slate-400 tracking-widest">TOTAL ESTÁNDARES</span>
                    <span className="text-3xl font-extrabold text-slate-800 bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                      {items.length} ítems
                    </span>
                  </div>
                  <TrendingUp className="w-6 h-6 text-emerald-500 opacity-30 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* --- MAIN CONTENT --- */}
      <div className="max-w-6xl mx-auto">
        <Card className="group border border-slate-200/70 shadow-3xl shadow-slate-300/40 bg-white/95 backdrop-blur-md rounded-3xl overflow-hidden hover:shadow-4xl transition-all duration-500">

          <CardHeader className="bg-gradient-to-br from-white to-emerald-50/50 border-b border-slate-200/70 px-8 py-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="w-1 h-8 bg-gradient-to-b from-emerald-600 to-teal-600 rounded-full"></div>
                <h2 className="text-2xl font-extrabold text-slate-900">Listado Maestro</h2>
              </div>

              <div className="relative w-full md:w-96 group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                <Input
                  placeholder="Buscar equipo o estándar..."
                  className="pl-11 pr-4 bg-white border-slate-300 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 h-11 shadow-md font-medium rounded-xl"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            {isLoading ? (
              <div className="h-96 flex flex-col items-center justify-center bg-gradient-to-br from-white to-slate-50">
                <div className="relative">
                  <div className="absolute inset-0 bg-emerald-500 rounded-full opacity-20 animate-ping"></div>
                  <Loader2 className="w-14 h-14 animate-spin text-emerald-600 relative z-10" />
                </div>
                <p className="font-bold text-slate-600 mt-6 text-lg">Sincronizando datos...</p>
                <p className="text-slate-400 text-sm mt-1">Obteniendo estándares de inventario</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-900 border-none">
                    <TableHead className="text-white font-extrabold h-14 pl-8 text-xs uppercase tracking-widest w-[50%]">
                      NOMBRE DEL EQUIPO
                    </TableHead>
                    <TableHead className="text-white font-extrabold h-14 text-center text-xs uppercase tracking-widest w-[25%]">
                      STOCK IDEAL
                    </TableHead>
                    <TableHead className="text-white font-extrabold h-14 text-right pr-8 text-xs uppercase tracking-widest w-[25%]">
                      ACCIONES
                    </TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {filteredItems.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} className="h-80 text-center">
                        <div className="flex flex-col items-center justify-center py-12">
                          <div className="p-6 bg-slate-50 rounded-2xl mb-4">
                            <Package className="w-16 h-16 text-slate-300" />
                          </div>
                          <p className="text-slate-600 font-bold text-lg">No se encontraron resultados</p>
                          <p className="text-slate-400 text-sm mt-1">Intenta con otros términos de búsqueda</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredItems.map((item, index) => (
                      <TableRow
                        key={item.id}
                        // Hover más sutil y elegante
                        className="group border-b border-slate-100/70 last:border-0 hover:bg-emerald-50/30 transition-all duration-200 ease-in-out"
                        style={{ animationDelay: `${index * 30}ms` }}
                      >
                        <TableCell className="pl-8 py-4">
                          <div className="flex items-center gap-3">
                            {/* Ícono de paquete con sombreado interno */}
                            <div className="p-2.5 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl shadow-inner group-hover:shadow-md transition-shadow">
                              <Package className="w-5 h-5 text-emerald-700" />
                            </div>
                            <span className="font-bold text-slate-800 text-base group-hover:text-emerald-700 transition-colors">
                              {item.normalized_name}
                            </span>
                          </div>
                        </TableCell>

                        <TableCell className="text-center py-4">
                          <div className="inline-flex items-center justify-center gap-2">
                            {/* Etiqueta de cantidad con estilo más llamativo */}
                            <span className="inline-flex items-center justify-center px-4 py-1.5 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 text-white font-extrabold text-base min-w-[5rem] shadow-lg shadow-emerald-500/30 group-hover:shadow-xl transition-shadow">
                              {item.quantity}
                            </span>
                          </div>
                        </TableCell>

                        <TableCell className="text-right pr-8 py-4">
                          <div className="flex justify-end gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-9 w-9 text-slate-500 hover:text-emerald-600 hover:bg-emerald-100/70 rounded-lg transition-all duration-200 hover:scale-105 hover:shadow-md"
                              onClick={() => handleEditClick(item)}
                              title="Editar Cantidad"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-9 w-9 text-slate-500 hover:text-red-600 hover:bg-red-100/70 rounded-lg transition-all duration-200 hover:scale-105 hover:shadow-md"
                              onClick={() => handleDeleteWrapper(item.id)}
                              title="Eliminar Estándar"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* --- MODAL INYECTADO --- */}
      <EditStandardDialog
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        item={selectedItem}
        onConfirm={handleSaveWrapper}
      />

    </div>
  );
}