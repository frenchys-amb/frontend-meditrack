import React from "react";
import { ChevronDown } from 'lucide-react';

// =========================================================================
// 1. CONTENEDOR RESPONSIVO (El "Ajuste" separado)
// =========================================================================

export const AdaptiveContainer: React.FC<{ 
    children: React.ReactNode, 
    title: string, 
    subtitle: string 
}> = ({ children, title, subtitle }) => {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-start py-6 px-4 sm:px-6 lg:px-8 transition-all duration-300">
            <div className="w-full max-w-lg md:max-w-2xl lg:max-w-4xl">
                {/* Header Adaptativo */}
                <div className="mb-6 text-center sm:text-left sm:flex sm:items-end sm:justify-between">
                    <div>
                        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">{title}</h1>
                        <p className="mt-1 text-sm text-gray-500">{subtitle}</p>
                    </div>
                    <div className="hidden sm:block">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Online
                        </span>
                    </div>
                </div>

                {/* Tarjeta Principal */}
                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                    {children}
                </div>

                <div className="mt-6 text-center text-xs text-gray-400">
                    Sistema Móvil v2.0 - Optimizado para Táctil
                </div>
            </div>
        </div>
    );
};

// =========================================================================
// 2. COMPONENTES UI (Inputs, Botones, Selects)
// =========================================================================

export const Label: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <label className="block text-sm font-semibold text-gray-700 mb-2">{children}</label>
);

export const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = (props) => (
    <input
        {...props}
        className="w-full p-3 text-base border border-gray-300 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 disabled:bg-gray-100 disabled:text-gray-400 touch-manipulation outline-none"
    />
);

export const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'danger' }> = ({ children, className, variant = 'primary', ...props }) => {
    const baseStyle = "w-full flex items-center justify-center px-4 py-3.5 border text-base font-semibold rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-200 touch-manipulation disabled:opacity-50 disabled:cursor-not-allowed";
    
    const variants = {
        primary: "border-transparent text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 focus:ring-indigo-500",
        secondary: "border-gray-300 text-gray-700 bg-white hover:bg-gray-50 active:bg-gray-100 focus:ring-indigo-500",
        danger: "border-transparent text-white bg-red-500 hover:bg-red-600 active:bg-red-700 focus:ring-red-500"
    };

    return (
        <button {...props} className={`${baseStyle} ${variants[variant]} ${className}`}>
            {children}
        </button>
    );
};

// SELECT CORREGIDO: Eliminamos capas extra que bloqueaban el evento onChange
export const NativeSelect: React.FC<{ 
    value: string, 
    onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void, // Usamos el evento estándar de React
    disabled?: boolean, 
    children: React.ReactNode,
    icon?: React.ReactNode
}> = ({ value, onChange, disabled, children, icon }) => {
    return (
        <div className="relative w-full">
            {icon && (
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none z-10">
                    {icon}
                </div>
            )}
            <select
                value={value}
                onChange={onChange}
                disabled={disabled}
                // 'appearance-none' es clave para iOS/Android, pero requiere nuestro propio icono de flecha
                className={`w-full p-3 ${icon ? 'pl-10' : ''} pr-10 text-base border border-gray-300 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 disabled:bg-gray-100 disabled:text-gray-400 appearance-none cursor-pointer touch-manipulation outline-none relative z-0`}
            >
                {children}
            </select>
            {/* Flecha personalizada */}
            <div className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 pointer-events-none z-10">
                <ChevronDown className="h-5 w-5" />
            </div>
        </div>
    );
};