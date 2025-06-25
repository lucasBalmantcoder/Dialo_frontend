import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

export default function Login() {
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [remainingAttempts, setRemainingAttempts] = useState(null);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    setRemainingAttempts(null);

    try {
      const response = await axios.post('http://127.0.0.1:5000/auth/login', {
        login,
        password,
      });

      localStorage.setItem('token', response.data.access_token);
      navigate('/dashboard');
    } catch (err) {
      if (err.response?.data?.error) {
        const msg = err.response.data.error;

        if (msg === "Account is blocked due to multiple failed login attempts") {
          setError("Conta bloqueada. Use a opção 'Esqueceu a senha?' para recuperar o acesso.");
        } else if (msg === "Email not confirmed") {
          setError("Seu e-mail ainda não foi confirmado.");
        } else if (msg === "Invalid login or password") {
          setError("Usuário ou senha inválidos.");
          if (err.response.data.remaining_attempts !== undefined) {
            setRemainingAttempts(err.response.data.remaining_attempts);
          }
        } else {
          setError(msg);
        }
      } else {
        setError('Erro ao fazer login');
      }
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: 'auto', paddingTop: '5rem' }}>
      <h2>Login</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {remainingAttempts !== null && (
        <p style={{ color: 'orange' }}>
          Tentativas restantes: {remainingAttempts}
        </p>
      )}
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
