import React from 'react';
import { Routes, Route } from 'react-router-dom';
import ParamedicLayout from '@/components/paramedic/ParamedicLayout';
import LoginPage from '@/pages/LoginPage';

const AppRoutes: React.FC = () => {
    return (
        <Routes>
            <Route path="/" element={<ParamedicLayout />}>
                <Route path="paramedic/checklist" element={<div>Formulario de Hoja de Chequeo de Unidad.</div>} />
                <Route path="paramedic/requisition" element={<div>Panel para Crear y Revisar Requisiciones.</div>} />
                <Route path="paramedic/equipment-usage" element={<div>Registro de Gastos de Equipos.</div>} />

                <Route index element={<div className="text-gray-700 text-lg">Selecciona una acción para comenzar.</div>} />
            </Route>

            <Route path="/login" element={<LoginPage />} /> {/* Página de login */}
        </Routes>
    );
};

export default AppRoutes;
