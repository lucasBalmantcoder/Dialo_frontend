import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

export default function Login() {
  const [login, setLogin] = useState(''); // username ou email
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      const response = await axios.post('http://127.0.0.1:5000/auth/login', {
        login,      // Alterado de username para login
        password,
      });

      localStorage.setItem('token', response.data.access_token);
      navigate('/dashboard');
    } catch (err) {
      if (err.response?.data?.error) {
        setError(err.response.data.error); // ex: "Email not confirmed"
      } else {
        setError('Erro ao fazer login');
      }
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: 'auto', paddingTop: '5rem' }}>
      <h2>Login</h2>
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
        <button type="submit" style={{ width: '100%' }}>Entrar</button>
      </form>

      <div style={{ marginTop: '1rem', textAlign: 'center' }}>
        <Link to="/forgot-password">Esqueceu a senha?</Link>
      </div>
    </div>
  );
}
