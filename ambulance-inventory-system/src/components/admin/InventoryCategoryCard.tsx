// src/components/admin/InventoryCategoryCard.tsx
// este es un compenente de storageequipmentpage
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, ArrowRight } from 'lucide-react';

interface Props {
  config: any; // O usa el tipo CategoryConfigType si lo exportaste
  stats: { count: number; lowStock: number };
  onClick: () => void;
}

export const InventoryCategoryCard = ({ config, stats, onClick }: Props) => {
  const Icon = config.icon;

  return (
    <Card
      onClick={onClick}
      className={`
        group cursor-pointer border-2 border-slate-100 shadow-lg bg-white 
        transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5
        ${config.borderHover} hover:border-opacity-100 
      `}
    >
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className={`p-3 rounded-xl ${config.bg} ${config.text} transition-colors group-hover:shadow-md group-hover:shadow-slate-200`}>
            <Icon className="h-6 w-6" />
          </div>
          {stats.lowStock > 0 ? (
            <Badge variant="destructive" className="animate-pulse flex items-center gap-1 bg-red-100 text-red-700 border border-red-200 shadow-none px-2.5 py-1 text-xs">
              <AlertTriangle className="h-3 w-3" />
              <span className="font-extrabold">{stats.lowStock}</span> Críticos
            </Badge>
          ) : (
            <Badge className="flex items-center bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-none px-2.5 py-1 text-xs">
              Stock Normal
            </Badge>
          )}
        </div>

        <div>
          <h3 className="text-base font-semibold text-slate-500 uppercase tracking-wider mb-1">
            {config.label}
          </h3>
          <div className="flex items-baseline gap-1">
            <span className="text-4xl font-extrabold text-slate-900 tracking-tight">
              {stats.count}
            </span>
            <span className="text-base text-slate-400 font-medium">items</span>
          </div>
        </div>

        <div className={`
          mt-6 pt-4 border-t border-slate-100 flex items-center justify-between
          text-sm font-bold ${config.text} opacity-85 group-hover:opacity-100 transition-opacity
        `}>
          <span>Ver inventario</span>
          <div className={`p-1 rounded-full ${config.bg} transition-transform group-hover:translate-x-1`}>
            <ArrowRight className="h-4 w-4" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};