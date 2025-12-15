import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import LoginPage from './pages/LoginPage';
import NotFoundPage from './pages/NotFoundPage';

// Layouts
import AdminLayout from './components/admin/AdminLayout';
import ParamedicLayout from './components/paramedic/ParamedicLayout';

// Admin Pages
import DashboardPage from './pages/admin/DashboardPage';
import StorageEquipmentPage from './pages/admin/StorageEquipmentPage';
import StorageMedicationsPage from './pages/admin/StorageMedicationsPage';
import AmbulancesPage from './pages/admin/AmbulancesPage';
import AmbulanceDetailPage from './pages/admin/AmbulanceDetailPage';
import UsersPage from './pages/admin/UsersPage';
import ActivityLogPage from './pages/admin/ActivityLogPage';
import { Toaster } from "@/components/ui/toaster";
import RecommendedPage from './pages/admin/RecommendedPage';

// Paramedic Pages
import ChecklistPage from './pages/paramedic/ChecklistPage';
import EquipmentUsagePage from './pages/paramedic/EquipmentUsagePage';
import RequisitionPage from './pages/paramedic/RequisitionPage';

function App() {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Cargando sistema...</p>
        </div>
      </div>
    );
  }

  return (
    <Router
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <Routes>
        {/* === LOGIN === */}
        <Route
          path="/login"
          element={
            isAuthenticated ? (
              user?.role === 'admin'
                ? <Navigate to="/admin/dashboard" replace />
                : <Navigate to="/paramedic/checklist" replace />
            ) : (
              <LoginPage />
            )
          }
        />

        {/* === RUTAS DE ADMINISTRADOR === */}
        {isAuthenticated && user?.role === 'admin' && (
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="storage/equipment" element={<StorageEquipmentPage />} />
            <Route path="storage/medications" element={<StorageMedicationsPage />} />
            <Route path="ambulances" element={<AmbulancesPage />} />
            <Route path="ambulances/:unitId" element={<AmbulanceDetailPage />} />
            <Route path="users" element={<UsersPage />} />
            <Route path="activity-log" element={<ActivityLogPage />} />
            <Route path="recommended" element={<RecommendedPage />} />
          </Route>
        )}

        {/* === RUTAS DE PARAMÉDICO === */}
        {isAuthenticated && user?.role === 'paramedic' && (
          <Route path="/paramedic" element={<ParamedicLayout />}>
            <Route index element={<Navigate to="checklist" replace />} />
            <Route path="checklist" element={<ChecklistPage />} />
            <Route path="equipment-usage" element={<EquipmentUsagePage />} />
            <Route path="requisition" element={<RequisitionPage />} />
          </Route>
        )}

        {/* === REDIRECCIONES DE SEGURIDAD === */}
        <Route path="/admin/*" element={isAuthenticated && user?.role === 'paramedic' ? <Navigate to="/paramedic/checklist" replace /> : <Navigate to="/login" replace />} />
        <Route path="/paramedic/*" element={isAuthenticated && user?.role === 'admin' ? <Navigate to="/admin/dashboard" replace /> : <Navigate to="/login" replace />} />

        {/* === RUTA RAÍZ === */}
        <Route
          path="/"
          element={
            !isAuthenticated ? (
              <Navigate to="/login" replace />
            ) : user?.role === 'admin' ? (
              <Navigate to="/admin/dashboard" replace />
            ) : (
              <Navigate to="/paramedic/checklist" replace />
            )
          }
        />

        {/* === 404 NOT FOUND === */}
        <Route
          path="*"
          element={
            !isAuthenticated ? <Navigate to="/login" replace /> : <NotFoundPage />
          }
        />
      </Routes>

      <Toaster />
    </Router>
  );
}

export default App;
