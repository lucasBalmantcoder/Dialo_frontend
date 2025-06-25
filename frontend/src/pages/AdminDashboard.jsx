import { useState } from 'react';
import axios from 'axios';
import styles from './AdminDashboard.module.css'; // Importa o CSS module

export default function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [deletedUsers, setDeletedUsers] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    setSuccessMessage(null);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://127.0.0.1:5000/admin/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(response.data);
    } catch {
      setError('Erro ao carregar usuários ativos. Verifique a conexão com a API.');
    } finally {
      setLoading(false);
    }
  };

  const fetchDeletedUsers = async () => {
    setLoading(true);
    setError(null);
    setSuccessMessage(null);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://127.0.0.1:5000/admin/list_all_user_delete', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDeletedUsers(response.data);
    } catch {
      setError('Erro ao carregar usuários deletados. Verifique a conexão com a API.');
    } finally {
      setLoading(false);
    }
  };

  const fetchAuditLogs = async () => {
    setLoading(true);
    setError(null);
    setSuccessMessage(null);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://127.0.0.1:5000/admin/audits', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAuditLogs(response.data);
    } catch {
      setError('Erro ao carregar registros de auditoria. Verifique a conexão com a API.');
    } finally {
      setLoading(false);
    }
  };

  const handleHardDelete = async (userId) => {
    setError(null);
    setSuccessMessage(null);
    if (!window.confirm('Tem certeza que deseja excluir permanentemente este usuário? Esta ação é irreversível.')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://127.0.0.1:5000/admin/${userId}/hard-delete`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccessMessage('Usuário excluído permanentemente com sucesso!');
      fetchUsers();
      fetchDeletedUsers();
    } catch (err) {
      setError('Erro ao excluir o usuário. Tente novamente.');
      console.error(err);
    }
  };

  // Nova função para fazer logout
  const handleLogout = () => {
    // Remove o token para invalidar a sessão
    localStorage.removeItem('token');
    // Redireciona o usuário para a página de login e substitui o histórico
    window.location.replace('/login'); 
  };

  return (
    <div className={styles.container}>
      {/* Novo cabeçalho com título e botão de sair */}
      <div className={styles.header}>
        <h1 className={styles.title}>Dashboard de Administração</h1>
        <button onClick={handleLogout} className={styles.logoutButton}>
          Sair
        </button>
      </div>

      {/* Exibição de mensagens de feedback */}
      {loading && <p className={styles.loading}>Carregando dados...</p>}
      {error && <div className={`${styles.alert} ${styles.error}`}>{error}</div>}
      {successMessage && <div className={`${styles.alert} ${styles.success}`}>{successMessage}</div>}

      {/* Seção de Usuários Ativos */}
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Usuários Ativos</h3>
        <button onClick={fetchUsers} className={styles.button}>
          Carregar Usuários Ativos
        </button>
        {users.length > 0 ? (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Usuário</th>
                <th>Email</th>
                <th>Admin</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id}>
                  <td>{user.username}</td>
                  <td>{user.email}</td>
                  <td>{user.is_admin ? 'Sim' : 'Não'}</td>
                  <td>
                    <button
                      onClick={() => handleHardDelete(user.id)}
                      className={styles.deleteButton}
                    >
                      Excluir
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className={styles.emptyState}>Nenhum usuário ativo para exibir. Clique em "Carregar Usuários Ativos".</p>
        )}
      </div>

      {/* Seção de Usuários Deletados */}
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Usuários Deletados</h3>
        <button onClick={fetchDeletedUsers} className={styles.button}>
          Carregar Usuários Deletados
        </button>
        {deletedUsers.length > 0 ? (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Usuário</th>
                <th>Email</th>
                <th>Data de Exclusão</th>
              </tr>
            </thead>
            <tbody>
              {deletedUsers.map(user => (
                <tr key={user.id}>
                  <td>{user.username}</td>
                  <td>{user.email}</td>
                  <td>{new Date(user.deleted_at).toLocaleString('pt-BR')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className={styles.emptyState}>Nenhum usuário deletado para exibir. Clique em "Carregar Usuários Deletados".</p>
        )}
      </div>
      
      {/* Nova Seção de Logs de Auditoria */}
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Registros de Auditoria</h3>
        <button onClick={fetchAuditLogs} className={styles.button}>
          Carregar Logs de Auditoria
        </button>
        {auditLogs.length > 0 ? (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Usuário ID</th>
                <th>Ação</th>
                <th>Detalhes</th>
                <th>Data/Hora</th>
              </tr>
            </thead>
            <tbody>
              {auditLogs.map(log => (
                <tr key={log.id}>
                  <td>{log.id}</td>
                  <td>{log.user_id || 'N/A'}</td>
                  <td>{log.action}</td>
                  <td>{log.details || 'N/A'}</td>
                  <td>{new Date(log.timestamp).toLocaleString('pt-BR')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className={styles.emptyState}>Nenhum registro de auditoria para exibir. Clique em "Carregar Logs de Auditoria".</p>
        )}
      </div>

    </div>
  );
}