import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Home from './pages/Home';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import ConfirmEmail from './pages/ConfirmEmail';
 



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
      
      <Route
        path="/dashboard"
        element={isAuthenticated() ? <Dashboard /> : <Navigate to="/" />}
      />
    </Routes>
  );
}
