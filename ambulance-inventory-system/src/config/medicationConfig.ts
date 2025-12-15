// este va con storagemedicationpage
import React from 'react';
import { AlertTriangle } from 'lucide-react';

export const STATUS_CONFIG = {
  EXPIRED: { 
    icon: React.createElement(AlertTriangle, { className: "h-4 w-4 text-red-600" }), 
    text: 'VENCIDO', 
    class: 'bg-red-50 text-red-700 font-bold border border-red-200' 
  },
  NEAR: { 
    icon: React.createElement(AlertTriangle, { className: "h-4 w-4 text-amber-600" }), 
    text: 'POR VENCER', 
    class: 'bg-amber-50 text-amber-700 font-medium border border-amber-200' 
  },
  GOOD: { 
    icon: null, 
    text: 'Vigente', 
    class: 'bg-emerald-50 text-emerald-700 font-medium border border-emerald-100' 
  },
};