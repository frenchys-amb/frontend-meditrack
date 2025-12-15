import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { useInventory } from '@/hooks/useInventory';
import { Archive, FileText, Plus, Zap, Loader2 } from 'lucide-react';

// 1. IMPORTAR CONFIG Y UTILIDADES NUEVAS
import { CATEGORY_CONFIG, categoriesList } from '@/config/inventoryConfig';
import { generateInventoryReport } from '@/utils/pdfReports';
import { InventoryCategoryCard } from '@/components/admin/InventoryCategoryCard';

// Importar Modales
import { AddEquipmentModal } from '@/components/admin/modals/AddEquipmentModal';
import { CategoryDetailModal } from '@/components/admin/modals/CategoryDetailModal';
import { EditEquipmentModal } from '@/components/admin/modals/EditEquipmentModal';
import { DeleteEquipmentDialog } from '@/components/admin/modals/DeleteEquipmentDialog';

const StorageEquipment = () => {
  const { equipment, isLoading, fetchInventory } = useInventory();

  // Estados de Modales
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  // Estados de Selección
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<any>(null);

  // Lógica: Filtros y Estadísticas
  const categoryItems = useMemo(() => {
    return selectedCategory ? equipment.filter(item => item.category === selectedCategory) : [];
  }, [equipment, selectedCategory]);

  const categoryStats = useMemo(() => {
    const stats: Record<string, { count: number, lowStock: number }> = {};
    categoriesList.forEach(cat => {
      const items = equipment.filter(e => e.category === cat.value);
      stats[cat.value] = {
        count: items.length,
        lowStock: items.filter(e => e.quantity < 5).length
      };
    });
    return stats;
  }, [equipment]);

  // Manejadores
  const openCategory = (cat: string) => {
    setSelectedCategory(cat);
    setIsDetailOpen(true);
  };

  const handleEdit = (item: any) => {
    setSelectedItem(item);
    setIsDetailOpen(false);
    setIsEditOpen(true);
  };

  const handleDelete = (item: any) => {
    setSelectedItem(item);
    setIsDetailOpen(false);
    setIsDeleteOpen(true);
  };

  if (isLoading) return (
    <div className="flex flex-col justify-center items-center h-96">
      <Loader2 className="h-12 w-12 text-slate-800 animate-spin mb-4" />
      <p className="text-slate-500">Cargando inventario...</p>
    </div>
  );

  return (
    <div className="w-full min-h-screen bg-slate-50 p-6 md:p-8 font-sans text-slate-900">
      <main className="max-w-7xl mx-auto space-y-10">

        {/* HEADER */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-200 pb-6">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
              <div className="p-2.5 bg-indigo-50 border border-indigo-100 rounded-xl shadow-sm">
                <Archive className="h-6 w-6 text-indigo-600" />
              </div>
              Inventario de Equipos
            </h1>
            <p className="text-slate-500 mt-2 text-base max-w-lg">
              Monitoriza el stock maestro de insumos médicos por categoría.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button
              variant="outline"
              onClick={() => generateInventoryReport(equipment)} // USAMOS LA NUEVA UTILIDAD AQUÍ
              className="bg-white border-slate-300 text-slate-700 hover:bg-slate-100 shadow-sm"
            >
              <FileText className="h-4 w-4 mr-2 text-rose-500" /> Exportar PDF
            </Button>

            <Button
              className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg transition-all"
              onClick={() => setIsAddOpen(true)}
            >
              <Plus className="h-4 w-4 mr-2" /> Agregar Nuevo Item
            </Button>
          </div>
        </header>

        {/* ALERTA */}
        <div className="flex items-center gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-xl text-yellow-800 shadow-sm">
          <Zap className="h-5 w-5 flex-shrink-0 text-yellow-600" />
          <p className="text-sm font-medium">
            Alerta: El stock crítico se define para items con menos de **5 unidades**.
          </p>
        </div>

        {/* GRID DE CATEGORÍAS (Ahora mucho más limpio) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {categoriesList.map((cat) => {
            // Validar que exista la config antes de renderizar
            const config = CATEGORY_CONFIG[cat.value];
            if (!config) return null;

            return (
              <InventoryCategoryCard
                key={cat.value}
                config={config}
                stats={categoryStats[cat.value]}
                onClick={() => openCategory(cat.value)}
              />
            );
          })}
        </div>

        {/* MODALES */}
        <AddEquipmentModal
          isOpen={isAddOpen}
          onClose={() => setIsAddOpen(false)}
          categories={categoriesList}
          onSuccess={() => fetchInventory()}
        />

        <CategoryDetailModal
          isOpen={isDetailOpen}
          onClose={() => {
            setSelectedCategory(null);
            setIsDetailOpen(false);
          }}
          categoryLabel={selectedCategory ? CATEGORY_CONFIG[selectedCategory]?.label : ''}
          categoryIcon={selectedCategory ? React.createElement(CATEGORY_CONFIG[selectedCategory].icon, { className: "h-6 w-6" }) : null}
          categoryColorClass={selectedCategory ? CATEGORY_CONFIG[selectedCategory]?.text : 'text-slate-600'}
          items={categoryItems}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />

        <EditEquipmentModal
          isOpen={isEditOpen}
          onClose={() => {
            setIsEditOpen(false);
            fetchInventory();
            if (selectedCategory) setIsDetailOpen(true);
          }}
          item={selectedItem}
        />

        <DeleteEquipmentDialog
          isOpen={isDeleteOpen}
          onClose={() => {
            setIsDeleteOpen(false);
            fetchInventory();
            if (selectedCategory) setIsDetailOpen(true);
          }}
          item={selectedItem}
        />

      </main>
    </div>
  );
};

export default StorageEquipment;