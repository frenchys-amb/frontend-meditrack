// este va con storageequipmentpage
import {
  Activity,
  Wind,
  Syringe,
  Box,
  Stethoscope,
  Briefcase,
  Package
} from 'lucide-react';

// Definición de tipos para mayor seguridad (opcional, pero recomendado)
type CategoryConfigType = {
  label: string;
  icon: any;
  bg: string;
  text: string;
  borderHover: string;
  shadowHover: string;
};

export const CATEGORY_CONFIG: Record<string, CategoryConfigType> = {
  'Inmovilización': {
    label: 'Inmovilización',
    icon: Activity,
    bg: 'bg-rose-50',
    text: 'text-rose-600',
    borderHover: 'group-hover:border-rose-200',
    shadowHover: 'group-hover:shadow-rose-100'
  },
  'oxigeno_airway': {
    label: 'Oxígeno/Airway',
    icon: Wind,
    bg: 'bg-sky-50',
    text: 'text-sky-600',
    borderHover: 'group-hover:border-sky-200',
    shadowHover: 'group-hover:shadow-sky-100'
  },
  'canalizacion': {
    label: 'Canalización',
    icon: Syringe,
    bg: 'bg-blue-50',
    text: 'text-blue-600',
    borderHover: 'group-hover:border-blue-200',
    shadowHover: 'group-hover:shadow-blue-100'
  },
  'miscelaneos': {
    label: 'Misceláneos',
    icon: Box,
    bg: 'bg-slate-100',
    text: 'text-slate-600',
    borderHover: 'group-hover:border-slate-300',
    shadowHover: 'group-hover:shadow-slate-100'
  },
  'entubacion': {
    label: 'Entubación',
    icon: Stethoscope,
    bg: 'bg-indigo-50',
    text: 'text-indigo-600',
    borderHover: 'group-hover:border-indigo-200',
    shadowHover: 'group-hover:shadow-indigo-100'
  },

  'equipo': {
    label: 'Equipo General',
    icon: Package,
    bg: 'bg-emerald-50',
    text: 'text-emerald-600',
    borderHover: 'group-hover:border-emerald-200',
    shadowHover: 'group-hover:shadow-emerald-100'
  },
};

export const categoriesList = Object.keys(CATEGORY_CONFIG).map(key => ({
  value: key,
  label: CATEGORY_CONFIG[key].label
}));