import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); // Novo estado para erros
  const [message, setMessage] = useState(''); // Novo estado para mensagens ao usuário
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!token) {
      // Se não há token, redireciona para a página inicial (login)
      navigate('/');
      return;
    }

    axios.get('http://127.0.0.1:5000/rooms', {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => {
      const salas = res.data;
      if (salas.length === 1) {
        // Se o usuário está em exatamente uma sala, redireciona para ela
        navigate(`/room/${salas[0].id}`);
      } else if (salas.length > 1) {
        // Se o usuário está em múltiplas salas, exibe uma mensagem
        setMessage("Você está em múltiplas salas. Por favor, selecione uma.");
        // Aqui você poderia renderizar uma lista de salas para o usuário escolher
      } else {
        // Se o usuário não está em nenhuma sala
        setMessage("Você não está em nenhuma sala. Crie ou entre em uma.");
        // Aqui você poderia renderizar botões para criar/entrar em sala
      }
    })
    .catch(err => {
      console.error("Erro ao buscar salas:", err);
      setError("Não foi possível carregar suas salas. Tente novamente mais tarde.");
      // Se for um erro 401 (Não Autorizado), pode ser token expirado/inválido
      if (err.response && err.response.status === 401) {
        localStorage.removeItem('token'); // Remove o token inválido
        navigate('/login'); // Redireciona para o login
      }
    })
    .finally(() => setLoading(false));
  }, [navigate, token]); // Dependências do useEffect

  if (loading) {
    return <p>Carregando salas...</p>;
  }

  if (error) {
    return <p style={{ color: 'red' }}>Erro: {error}</p>;
  }

  // Se não está carregando e não há erro, mas também não redirecionou,
  // exibe a mensagem apropriada
  return (
    <div>
      <p>Redirecionando...</p>
      {message && <p>{message}</p>}
      {/* Aqui você pode adicionar lógica para renderizar botões ou listas de salas */}
      {/* Exemplo: */}
      {/* {message.includes("múltiplas salas") && (
        <div>
          <h3>Suas Salas:</h3>
          <ul>
            {salas.map(sala => (
              <li key={sala.id}><Link to={`/room/${sala.id}`}>{sala.name}</Link></li>
            ))}
          </ul>
        </div>
      )} */}
    </div>
  );
}
