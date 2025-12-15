import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ResponsiveContainer, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { DashboardStats } from '@/types';
import { supabase } from '@/lib/supabase';
import { formatNumber } from '@/lib/utils';

// Interface for the local calculation of shortages
interface CriticalShortageItem {
    name: string;
    current: number;
    recommended: number;
    category: string;
}

const Dashboard: React.FC = () => {
    const [stats, setStats] = useState<DashboardStats>({
        totalEquipment: 0,
        totalMedications: 0,
        monthlyMovements: 0,
        equipmentByCategory: [],
        criticalShortages: []
    });

    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchDashboardStats();
    }, []);

    const fetchDashboardStats = async () => {
        setIsLoading(true);
        try {
            // Total de equipos
            const { data: equipmentData, error: equipmentError } = await supabase
                .from('storage_equipment')
                .select('quantity');
            if (equipmentError) throw equipmentError;

            const totalEquipment = equipmentData.reduce((sum, item) => sum + item.quantity, 0);

            // Total de medicamentos
            const { data: medicationData, error: medicationError } = await supabase
                .from('storage_medications')
                .select('quantity');
            if (medicationError) throw medicationError;

            const totalMedications = medicationData.reduce((sum, item) => sum + item.quantity, 0);

            // Movimientos del mes
            const currentMonth = new Date().getMonth();
            const currentYear = new Date().getFullYear();
            const startDate = new Date(currentYear, currentMonth, 1).toISOString();
            const endDate = new Date(currentYear, currentMonth + 1, 0).toISOString();

            const { data: activityData, error: activityError } = await supabase
                .from('activity_log')
                .select('*')
                .gte('created_at', startDate)
                .lte('created_at', endDate);

            if (activityError) throw activityError;

            const monthlyMovements = activityData.length;

            // Equipos por categoría
            const { data: categoryData, error: categoryError } = await supabase
                .from('storage_equipment')
                .select('category, quantity');

            if (categoryError) throw categoryError;

            const equipmentByCategoryMap: Record<string, number> = {};

            categoryData.forEach(item => {
                equipmentByCategoryMap[item.category] = (equipmentByCategoryMap[item.category] || 0) + item.quantity;
            });

            const equipmentByCategoryArray = Object.keys(equipmentByCategoryMap).map(category => ({
                category,
                count: equipmentByCategoryMap[category]
            }));

            // Faltantes críticos
            const { data: ambulanceData, error: ambulanceError } = await supabase
                .from('ambulance_equipment')
                .select('*');
            if (ambulanceError) throw ambulanceError;

            const currentEquipment: Record<string, number> = {};
            ambulanceData.forEach(item => {
                currentEquipment[item.normalized_name] =
                    (currentEquipment[item.normalized_name] || 0) + item.quantity;
            });

            const { getFullRecommendedInventory } = await import('@/data/recommendedInventory');
            // Cast as a nested Record to allow string indexing in loops
            const recommendedInventory = getFullRecommendedInventory() as Record<string, Record<string, number>>;

            // Explicitly type the array to avoid "implicitly has type 'any[]'"
            const criticalShortages: CriticalShortageItem[] = [];

            Object.keys(recommendedInventory).forEach(category => {
                Object.keys(recommendedInventory[category]).forEach(itemName => {
                    const normalized = itemName.toLowerCase().replace(/[^a-z0-9_]/g, '_');
                    const recommended = recommendedInventory[category][itemName];
                    const current = currentEquipment[normalized] || 0;

                    const percentage = (current / recommended) * 100;

                    if (percentage < 30) {
                        criticalShortages.push({
                            name: itemName,
                            current,
                            recommended,
                            category,
                        });
                    }
                });
            });

            criticalShortages.sort((a, b) => (a.current / a.recommended) - (b.current / b.recommended));
            criticalShortages.splice(10);

            setStats({
                totalEquipment,
                totalMedications,
                monthlyMovements,
                equipmentByCategory: equipmentByCategoryArray,
                criticalShortages
            });

        } catch (error) {
            console.error('Error fetching dashboard stats:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

    const [movementsByDay, setMovementsByDay] = useState<any[]>([]);

    useEffect(() => {
        const fetchMovementsByDay = async () => {
            try {
                const currentMonth = new Date().getMonth();
                const currentYear = new Date().getFullYear();
                const startDate = new Date(currentYear, currentMonth, 1).toISOString();
                const endDate = new Date(currentYear, currentMonth + 1, 0).toISOString();

                const { data, error } = await supabase
                    .from('activity_log')
                    .select('created_at')
                    .gte('created_at', startDate)
                    .lte('created_at', endDate);

                if (error) throw error;

                const map: Record<number, number> = {};

                data.forEach(item => {
                    const day = new Date(item.created_at).getDate();
                    map[day] = (map[day] || 0) + 1;
                });

                const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
                const result = [];

                for (let i = 1; i <= daysInMonth; i++) {
                    result.push({
                        day: i,
                        movements: map[i] || 0
                    });
                }

                setMovementsByDay(result);
            } catch (error) {
                console.error('Error fetching movements by day:', error);
            }
        };

        fetchMovementsByDay();
    }, []);

    const [movementsByMonth, setMovementsByMonth] = useState<any[]>([]);

    useEffect(() => {
        const fetchMovementsByMonth = async () => {
            try {
                const year = new Date().getFullYear();
                const startDate = new Date(year, 0, 1).toISOString();
                const endDate = new Date(year, 11, 31).toISOString();

                const { data, error } = await supabase
                    .from('activity_log')
                    .select('created_at')
                    .gte('created_at', startDate)
                    .lte('created_at', endDate);

                if (error) throw error;

                const map: Record<number, number> = {};

                data.forEach(item => {
                    const month = new Date(item.created_at).getMonth();
                    map[month] = (map[month] || 0) + 1;
                });

                const names = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
                const result = [];

                for (let i = 0; i < 12; i++) {
                    result.push({
                        month: names[i],
                        movements: map[i] || 0
                    });
                }

                setMovementsByMonth(result);
            } catch (error) {
                console.error('Error fetching movements by month:', error);
            }
        };

        fetchMovementsByMonth();
    }, []);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Cargando dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">

            {/* CARDS SUPERIORES */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

                {/* TOTAL EQUIPOS */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total de Equipos</CardTitle>
                        <svg className="h-4 w-4 text-muted-foreground" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                        </svg>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatNumber(stats.totalEquipment)}</div>
                        <p className="text-xs text-muted-foreground">En almacenamiento</p>
                    </CardContent>
                </Card>

                {/* TOTAL MEDICAMENTOS */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total de Medicamentos</CardTitle>
                        <svg className="h-4 w-4 text-muted-foreground" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6h14zM10 11v6M14 11v6" />
                        </svg>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatNumber(stats.totalMedications)}</div>
                        <p className="text-xs text-muted-foreground">En almacenamiento</p>
                    </CardContent>
                </Card>

                {/* MOVIMIENTOS DEL MES */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Movimientos del Mes</CardTitle>
                        <svg className="h-4 w-4 text-muted-foreground" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                        </svg>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatNumber(stats.monthlyMovements)}</div>
                        <p className="text-xs text-muted-foreground">Últimos 30 días</p>
                    </CardContent>
                </Card>

                {/* FALTANTES CRÍTICOS */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Faltantes Críticos</CardTitle>
                        <svg className="h-4 w-4 text-red-500" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
                            <line x1="12" y1="9" x2="12" y2="13" />
                            <line x1="12" y1="17" x2="12.01" y2="17" />
                        </svg>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-500">{stats.criticalShortages.length}</div>
                        <p className="text-xs text-muted-foreground">Por debajo del 30%</p>
                    </CardContent>
                </Card>

            </div>

            {/* GRÁFICAS */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Movimientos Diarios (Este Mes)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={movementsByDay}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="day" />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="movements" fill="#8884d8" />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Tendencia de Movimientos (Este Año)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={movementsByMonth}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="month" />
                                <YAxis />
                                <Tooltip />
                                <Line type="monotone" dataKey="movements" stroke="#82ca9d" strokeWidth={2} />
                            </LineChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>

            {/* FALTANTES Y PIE CHART */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle>Faltantes Críticos de Equipo</CardTitle>
                        <CardDescription>Equipos con menos del 30% del stock recomendado.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {stats.criticalShortages.length > 0 ? (
                                stats.criticalShortages.map((item, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center justify-between p-3 bg-red-50 rounded-md border border-red-200"
                                    >
                                        <div>
                                            <p className="font-medium text-red-900">{item.name}</p>
                                            <p className="text-sm text-red-700">{item.category}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-red-900">
                                                {item.current} / {item.recommended}
                                            </p>
                                            <p className="text-sm text-red-700">
                                                Faltan: {item.recommended - item.current}
                                            </p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-center text-gray-500 py-4">No hay faltantes críticos.</p>
                            )}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Equipos por Categoría</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={stats.equipmentByCategory}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ category, percent }) =>
                                        `${category}: ${(percent * 100).toFixed(0)}%`
                                    }
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="count"
                                >
                                    {stats.equipmentByCategory.map((_entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default Dashboard;