import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function AdminLogin() {
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      const response = await axios.post('http://127.0.0.1:5000/admin/login', {
        login,
        password,
      });

      localStorage.setItem('token', response.data.access_token);
      navigate('/admin/dashboard'); // Redireciona para dashboard do admin
    } catch (err) {
      if (err.response?.data?.error) {
        setError(err.response.data.error); // Mensagem do backend
      } else {
        setError('Erro ao fazer login como admin');
      }
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: 'auto', paddingTop: '5rem' }}>
      <h2>Login de Administrador</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={handleLogin}>
        <input
          type="text"
          placeholder="Usuário ou E-mail"
          value={login}
          onChange={(e) => setLogin(e.target.value)}
          required
          style={{ display: 'block', marginBottom: '1rem', width: '100%' }}
        />
        <input
          type="password"
          placeholder="Senha"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{ display: 'block', marginBottom: '1rem', width: '100%' }}
        />
        <button type="submit" style={{ width: '100%' }}>Entrar como Admin</button>
      </form>
    </div>
  );
}
