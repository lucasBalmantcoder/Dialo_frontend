import { useNavigate } from 'react-router-dom';

export default function Home() {
  const navigate = useNavigate();

  return (
    <div style={{
      maxWidth: 600,
      margin: 'auto',
      padding: '4rem 1rem',
      textAlign: 'center',
      fontFamily: 'Arial, sans-serif',
    }}>
      <h1>Bem-vindo ao Dialo</h1>
      <p style={{ fontSize: '1.2rem', marginBottom: '2rem' }}>
        Converse com seus amigos, crie grupos e compartilhe mensagens instantaneamente.
        Este é o Dialo, um site de convesas online.
      </p>

      <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
        <button
          onClick={() => navigate('/login')}
          style={{
            padding: '0.8rem 2rem',
            fontSize: '1rem',
            cursor: 'pointer',
            borderRadius: '5px',
            border: 'none',
            backgroundColor: '#007bff',
            color: 'white',
          }}
        >
          Login
        </button>

        <button
          onClick={() => navigate('/register')}
          style={{
            padding: '0.8rem 2rem',
            fontSize: '1rem',
            cursor: 'pointer',
            borderRadius: '5px',
            border: '2px solid #007bff',
            backgroundColor: 'white',
            color: '#007bff',
          }}
        >
          Cadastrar
        </button>
      </div>
    </div>
  );
}
