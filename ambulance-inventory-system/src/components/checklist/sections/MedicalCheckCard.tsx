import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Activity,
    CheckCircle2,
    XCircle,
    AlertTriangle,
    Stethoscope,
    HelpCircle
} from "lucide-react";

// Lista de equipos
const MEDICAL_EQUIPMENT_FIELDS = [
    { id: "eq_monitor_cardiaco", label: "Monitor Cardíaco" },
    { id: "eq_esfigmo_adulto", label: "Esfigmomanómetro (Adulto)" },
    { id: "eq_esfigmo_pediatrico", label: "Esfigmomanómetro (Pediátrico)" },
    { id: "eq_esfigmo_neonatal", label: "Esfigmomanómetro (Neonatal)" },
    { id: "eq_oximetro", label: "Oxímetro de Pulso" },
    { id: "eq_glucometro", label: "Glucómetro" },
    { id: "eq_estetoscopio", label: "Estetoscopio" },
    { id: "eq_iv_pump", label: "Bomba de Infusión (IV Pump)" },
    { id: "eq_ventilador", label: "Ventilador Mecánico" },
];

interface Props {
    form: any;
    onChange: (key: string, value: string) => void;
}

export const MedicalCheckCard = ({ form, onChange }: Props) => {

    // Función para determinar el color y el icono según el estado
    const getStatusStyles = (value: string) => {
        switch (value) {
            case "Ok":
                return {
                    border: "border-l-emerald-500",
                    bg: "bg-emerald-50/50",
                    icon: <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                };
            case "Mal Estado":
                return {
                    border: "border-l-red-500",
                    bg: "bg-red-50/50",
                    icon: <XCircle className="w-4 h-4 text-red-600" />
                };
            case "No Hay":
                return {
                    border: "border-l-amber-500",
                    bg: "bg-amber-50/50",
                    icon: <AlertTriangle className="w-4 h-4 text-amber-600" />
                };
            default:
                return {
                    border: "border-l-slate-200",
                    bg: "bg-white",
                    icon: <HelpCircle className="w-4 h-4 text-slate-300" />
                };
        }
    };

    return (
        <Card className="shadow-md border-slate-200 h-full overflow-hidden flex flex-col">
            {/* HEADER ROJO CLÍNICO */}
            <CardHeader className="bg-gradient-to-r from-red-50 to-white border-b border-red-100 py-4">
                <CardTitle className="text-base font-bold flex items-center gap-2 text-red-800">
                    <div className="p-1.5 bg-white rounded-md shadow-sm border border-red-100">
                        <Activity className="h-5 w-5 text-red-600" />
                    </div>
                    Equipo Biomédico
                </CardTitle>
            </CardHeader>

            <CardContent className="p-0 flex-1 bg-slate-50/30">
                <div className="divide-y divide-slate-100">
                    {MEDICAL_EQUIPMENT_FIELDS.map((item) => {
                        const currentValue = form[item.id] || "";
                        const styles = getStatusStyles(currentValue);

                        return (
                            <div
                                key={item.id}
                                className={`
                  group grid grid-cols-12 items-center p-3 transition-all duration-200 hover:bg-white
                  border-l-[4px] ${styles.border} ${currentValue ? styles.bg : ''}
                `}
                            >

                                {/* Nombre del Equipo */}
                                <div className="col-span-6 sm:col-span-7 font-medium text-sm text-slate-700 flex items-center gap-3">
                                    <div className={`p-1.5 rounded-full ${currentValue ? 'bg-white shadow-sm' : 'bg-slate-100'}`}>
                                        {currentValue ? styles.icon : <Stethoscope className="w-3.5 h-3.5 text-slate-400" />}
                                    </div>
                                    <span className={currentValue === "Mal Estado" || currentValue === "No Hay" ? "text-red-700 font-semibold" : ""}>
                                        {item.label}
                                    </span>
                                </div>

                                {/* Selector de Estado */}
                                <div className="col-span-6 sm:col-span-5 flex justify-end">
                                    <div className="relative w-full max-w-[140px]">
                                        <select
                                            value={currentValue}
                                            onChange={(e) => onChange(item.id, e.target.value)}
                                            className={`
                        w-full appearance-none py-1.5 pl-3 pr-8 rounded-md text-xs font-bold border cursor-pointer outline-none focus:ring-2 focus:ring-offset-1 transition-all
                        ${!currentValue
                                                    ? "bg-white border-slate-300 text-slate-500 hover:border-slate-400"
                                                    : "border-transparent shadow-sm"}
                        ${currentValue === "Ok" ? "bg-emerald-100 text-emerald-800 focus:ring-emerald-500" : ""}
                        ${currentValue === "Mal Estado" ? "bg-red-100 text-red-800 focus:ring-red-500" : ""}
                        ${currentValue === "No Hay" ? "bg-amber-100 text-amber-800 focus:ring-amber-500" : ""}
                      `}
                                        >
                                            <option value="" disabled>Estado...</option>
                                            <option value="Ok">✅ Operativo</option>
                                            <option value="Mal Estado">❌ Dañado</option>
                                            <option value="No Hay">⚠️ Faltante</option>
                                        </select>

                                        {/* Flecha personalizada para el select */}
                                        <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                                            <svg className={`w-3 h-3 ${currentValue ? 'text-current opacity-70' : 'text-slate-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                                            </svg>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </CardContent>
        </Card>
    );
};