import React from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 text-center">
      <h1 className="text-6xl font-bold text-gray-800 mb-4">404</h1>
      <h2 className="text-2xl font-semibold text-gray-600 mb-6">Página No Encontrada</h2>
      <p className="text-gray-500 mb-8">Lo sentimos, la página que buscas no existe.</p>
      <Button onClick={() => navigate(-1)}>Volver Atrás</Button>
    </div>
  );
};

export default NotFoundPage;