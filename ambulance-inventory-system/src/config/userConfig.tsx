// este va con userspage
import { Shield, Truck } from 'lucide-react';
import { Badge } from "@/components/ui/badge";

export const ROLE_CONFIG: Record<string, any> = {
  admin: {
    label: 'Administrador',
    badge: (
      <Badge className="bg-rose-100 text-rose-800 border border-rose-200 shadow-none px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 w-fit">
        <Shield className="h-3 w-3 fill-rose-300 text-rose-600" />
        Administrador
      </Badge>
    )
  },
  paramedic: {
    label: 'Paramédico',
    badge: (
      <Badge className="bg-indigo-100 text-indigo-800 border border-indigo-200 shadow-none px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 w-fit">
        <Truck className="h-3 w-3 fill-indigo-300 text-indigo-600" />
        Paramédico
      </Badge>
    )
  }
};