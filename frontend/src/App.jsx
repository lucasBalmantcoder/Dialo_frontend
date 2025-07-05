import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Home from './pages/Home';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import ConfirmEmail from './pages/ConfirmEmail';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import Room from './pages/Room'; // <--- ADICIONE ESTA LINHA (ajuste o caminho se for diferente)


const isAuthenticated = () => {
  return !!localStorage.getItem('token');
};

export default function App() {
  return (
    <Routes>
      {/* Rotas de autenticação */}
        <Route path="/" element={< Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/confirm-email/:token" element={<ConfirmEmail />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route
        path="/room/:roomId"
        element={isAuthenticated() ? <Room /> : <Navigate to="/" />}
        />
        
      
      <Route
        path="/dashboard"
        element={isAuthenticated() ? <Dashboard /> : <Navigate to="/" />}
      />
    </Routes>
  );
}