import { Routes, Route, Navigate, Outlet } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Calendar from './pages/Calendar'
import Appointments from './pages/Appointments'
import Analytics from './pages/Analytics'
import Settings from './pages/Settings'
import Login from './pages/Login'
import Register from './pages/Register'
import { useAuthStore } from './store/authStore'

function App() {
  const { isAuthenticated } = useAuthStore();

  // Componente para proteger rotas privadas
  const PrivateRoute = () => {
    return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
  };

  return (
    <Routes>
      {/* Redirecionamento para rota correta ao acessar '/' */}
      <Route path="/" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />} />

      {/* Rotas públicas */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Rotas privadas protegidas */}
      <Route element={<PrivateRoute />}>
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/appointments" element={<Appointments />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
      </Route>

      {/* Fallback para rotas não encontradas */}
      <Route path="*" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />} />
    </Routes>
  );
}

export default App
