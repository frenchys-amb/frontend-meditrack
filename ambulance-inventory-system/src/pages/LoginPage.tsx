import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, LogIn } from 'lucide-react';

const LoginPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, isLoading, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  // Redirigir según el rol cuando se autentica
  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === 'admin') {
        navigate('/admin/dashboard', { replace: true });
      } else if (user.role === 'paramedic') {
        navigate('/paramedic/checklist', { replace: true });
      }
    }
  }, [isAuthenticated, user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username || !password) {
      setError('Por favor, ingresa tu usuario y contraseña.');
      return;
    }

    try {
      await login(username, password);
    } catch (err: any) {
      setError(err.message || 'Credenciales inválidas. Por favor, inténtalo de nuevo.');
    }
  };

  return (
    // Fondo gris oscuro elegante
    <div className="flex items-center justify-center min-h-screen p-4 relative overflow-hidden">

      {/* Patrón de Fondo Animado - Tonos grises azulados */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-900 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gray-800 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 w-72 h-72 bg-indigo-900 rounded-full mix-blend-multiply filter blur-3xl opacity-15 animate-blob animation-delay-4000"></div>
      </div>

      {/* Card Principal - Fondo blanco con sombras mejoradas */}
      <Card
        className="w-full max-w-md p-6 shadow-2xl border border-black rounded-2xl z-10 
                   bg-slate-50 text-black
                   transform transition-transform duration-300 hover:shadow-2xl"
      >
        <CardHeader className="pt-4">
          {/* Logo/Icono con colores médicos sobre fondo oscuro */}
          <div
            className="p-3 rounded-full w-fit mx-auto shadow-lg"
            style={{
              backgroundColor: '#2d3748',
              boxShadow: '0 0 15px rgba(45, 55, 72, 0.7)'
            }}
          >
            <LogIn className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-3xl font-black text-center text-black tracking-tight mt-3">
            MediTrack
          </CardTitle>
          <CardDescription className="text-center text-black mt-2 text-base">
            Sistema de gestión médica
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-4">
          <form onSubmit={handleSubmit} className="space-y-6">

            <div className="space-y-2">
              <Label htmlFor="username" className="text-sm font-semibold text-black">Usuario</Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                disabled={isLoading}
                placeholder="Tu nombre de usuario"
                className="rounded-xl border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 
                           transition-all bg-gray-50 text-gray-900 placeholder-gray-500 h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-semibold text-black">Contraseña</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
                placeholder="••••••••"
                className="rounded-xl border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 
                           transition-all bg-gray-50 text-gray-900 placeholder-gray-500 h-11"
              />
            </div>

            {error && (
              <div className="flex items-center p-3 text-sm text-red-700 bg-red-100 border border-red-300 rounded-xl shadow-sm">
                <AlertTriangle className="h-5 w-5 mr-3 flex-shrink-0 text-red-500" />
                <span className="font-medium">{error}</span>
              </div>
            )}

            {/* Botón con colores que contrastan con el fondo oscuro */}
            <Button
              type="submit"
              className="w-full text-white font-extrabold py-3 rounded-xl h-12 transition-all duration-300"
              disabled={isLoading}
              style={{
                background: 'linear-gradient(90deg, #2d3748, #4a5568)',
                boxShadow: '0 4px 15px rgba(45, 55, 72, 0.4)'
              }}
            >
              {isLoading ? (
                <div className='flex items-center justify-center'>
                  <LogIn className="w-5 h-5 mr-2 animate-spin" />
                  Iniciando sesión...
                </div>
              ) : (
                'Entrar'
              )}
            </Button>

          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginPage;