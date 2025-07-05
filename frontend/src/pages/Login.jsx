import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { JSEncrypt } from 'jsencrypt/bin/jsencrypt'; // Importa JSEncrypt

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

      const token = response.data.access_token;
      localStorage.setItem('token', token);

      // --- Lógica de Geração e Armazenamento de Chaves ---
      const existingPrivateKey = localStorage.getItem('private_key');

      if (!existingPrivateKey) {
        console.log("Chave privada não encontrada. Gerando novo par de chaves...");
        const encrypt = new JSEncrypt({ default_key_size: 2048 });
        const privateKey = encrypt.getPrivateKey();
        const publicKey = encrypt.getPublicKey();

        if (privateKey && publicKey) {
          localStorage.setItem('private_key', privateKey); // Salva a chave privada localmente

          // Envia a chave pública para o backend
          await axios.patch('http://127.0.0.1:5000/auth/public_key', {
            public_key: publicKey
          }, {
            headers: { Authorization: `Bearer ${token}` }
          });
          console.log("Chave pública enviada para o backend com sucesso.");
        } else {
          console.error("Falha ao gerar par de chaves RSA.");
          setError("Erro ao gerar chaves de segurança. Tente novamente.");
          localStorage.removeItem('token'); // Se não gerou chaves, remove o token
          return;
        }
      } else {
        console.log("Chave privada já existe. Usando chave existente.");
      }
      // --- Fim da Lógica de Geração de Chaves ---

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
