import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
// Importação CORRETA para JSEncrypt (importa a classe principal)
import JSEncrypt from 'jsencrypt/bin/jsencrypt';
// Importação CORRETA para CryptoJS (importa o objeto principal)
import CryptoJS from 'crypto-js';

export default function Room() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const [room, setRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);

  // Chave privada do usuário logado (deve ser armazenada com segurança, localStorage é para demo)
  const currentUserPrivateKey = localStorage.getItem('private_key');
  // Extrai o ID do usuário do token JWT e CONVERTE PARA NÚMERO
  const currentUserId = token ? parseInt(JSON.parse(atob(token.split('.')[1])).sub, 10) : null; // <-- CORREÇÃO AQUI

  // DEBUG: Log da chave privada ao carregar o componente
  useEffect(() => {
    console.log("DEBUG ROOM: Chave privada do usuário (localStorage):", currentUserPrivateKey);
    if (!currentUserPrivateKey) {
      console.warn("DEBUG ROOM: currentUserPrivateKey está ausente no localStorage!");
    } else {
      console.log("DEBUG ROOM: Chave privada tem tamanho:", currentUserPrivateKey.length);
      // Opcional: Tentar inicializar JSEncrypt para ver se a chave é válida
      try {
        const testDecrypt = new JSEncrypt();
        testDecrypt.setPrivateKey(currentUserPrivateKey);
        console.log("DEBUG ROOM: JSEncrypt conseguiu carregar a chave privada.");
      } catch (e) {
        console.error("DEBUG ROOM: JSEncrypt FALHOU ao carregar a chave privada:", e);
      }
    }
  }, [currentUserPrivateKey]);


  // Funções de Criptografia/Descriptografia
  const encryptWithPublicKey = (message, publicKey) => {
    console.log("DEBUG ENCRYPT: Mensagem:", message);
    console.log("DEBUG ENCRYPT: Chave Pública (início):", publicKey ? publicKey.substring(0, 50) + "..." : "null");
    try {
      const encrypt = new JSEncrypt();
      encrypt.setPublicKey(publicKey);
      const encrypted = encrypt.encrypt(message);
      console.log("DEBUG ENCRYPT: Resultado da Criptografia RSA:", encrypted ? encrypted.substring(0, 50) + "..." : "FALHA");
      return encrypted;
    } catch (e) {
      console.error("Erro ao criptografar com chave pública:", e);
      return null;
    }
  };

  const decryptWithPrivateKey = (encryptedMessage, privateKey) => {
    console.log("DEBUG DECRYPT: Mensagem Criptografada RSA (início):", encryptedMessage ? encryptedMessage.substring(0, 50) + "..." : "null");
    console.log("DEBUG DECRYPT: Chave Privada (início):", privateKey ? privateKey.substring(0, 50) + "..." : "null");
    try {
      const decrypt = new JSEncrypt();
      decrypt.setPrivateKey(privateKey);
      const decrypted = decrypt.decrypt(encryptedMessage);
      console.log("DEBUG DECRYPT: Resultado da Descriptografia RSA:", decrypted ? decrypted.substring(0, 50) + "..." : "FALHA");
      return decrypted;
    } catch (e) {
      console.error("Erro ao descriptografar com chave privada:", e);
      return null;
    }
  };

  const generateSymmetricKey = () => {
    // Gera uma chave AES aleatória (256 bits)
    const key = CryptoJS.lib.WordArray.random(32).toString(); // 32 bytes = 256 bits
    console.log("DEBUG SYMMETRIC: Chave simétrica gerada:", key);
    return key;
  };

  // Função para criptografar a mensagem para todos os participantes
  const encryptMessageForRoom = (messageContent, roomUsers, senderId, symmetricKey) => {
    console.log("DEBUG ENCRYPT_ROOM: Criptografando mensagem para sala. Conteúdo:", messageContent);
    console.log("DEBUG ENCRYPT_ROOM: Usuários na sala:", roomUsers);

    const encryptedContent = CryptoJS.AES.encrypt(messageContent, symmetricKey).toString();
    const encryptedSymmetricKeys = [];

    roomUsers.forEach(user => {
      console.log(`DEBUG ENCRYPT_ROOM: Processando usuário ${user.username} (ID: ${user.id}). Chave Pública: ${user.public_key ? user.public_key.substring(0, 50) + "..." : "AUSENTE/NULL"}`);
      if (user.public_key) {
        const encryptedKey = encryptWithPublicKey(symmetricKey, user.public_key);
        if (encryptedKey) {
          encryptedSymmetricKeys.push({
            user_id: user.id,
            encrypted_key: encryptedKey
          });
          console.log(`DEBUG ENCRYPT_ROOM: Chave simétrica criptografada para ${user.username}.`);
        } else {
          console.error(`DEBUG ENCRYPT_ROOM: Falha na criptografia da chave simétrica para ${user.username}.`);
        }
      } else {
        console.warn(`DEBUG ENCRYPT_ROOM: Usuário ${user.username} (ID: ${user.id}) não tem chave pública para criptografia.`);
      }
    });

    const payload = {
      encrypted_content: encryptedContent,
      encrypted_symmetric_keys: encryptedSymmetricKeys,
      sender_id: senderId
    };
    console.log("DEBUG ENCRYPT_ROOM: Payload final gerado:", payload);
    return JSON.stringify(payload);
  };

  // Função para descriptografar a mensagem recebida
  const decryptMessageForCurrentUser = (encryptedPayloadStr) => {
    console.log("DEBUG DECRYPT_CURRENT: Tentando descriptografar payload:", encryptedPayloadStr ? encryptedPayloadStr.substring(0, 100) + "..." : "null");
    console.log("DEBUG DECRYPT_CURRENT: Chave privada atual do usuário (início):", currentUserPrivateKey ? currentUserPrivateKey.substring(0, 50) + "..." : "AUSENTE");
    console.log("DEBUG DECRYPT_CURRENT: ID do usuário atual:", currentUserId); // currentUserId agora é um número

    if (!currentUserPrivateKey) {
      console.error("DEBUG DECRYPT_CURRENT: Chave privada do usuário não encontrada. Não é possível descriptografar.");
      return "[Mensagem Criptografada - Chave Privada Ausente]";
    }

    try {
      const payload = JSON.parse(encryptedPayloadStr);
      const { encrypted_content, encrypted_symmetric_keys, sender_id } = payload;

      console.log("DEBUG DECRYPT_CURRENT: Chaves simétricas criptografadas no payload:", encrypted_symmetric_keys);

      // Encontra a chave simétrica criptografada para o usuário atual
      const encryptedKeyForCurrentUser = encrypted_symmetric_keys.find(
        key => key.user_id === currentUserId // currentUserId agora é um número, key.user_id também é um número
      );

      if (!encryptedKeyForCurrentUser) {
        console.warn("DEBUG DECRYPT_CURRENT: Chave simétrica para o usuário atual NÃO encontrada na mensagem. currentUserId:", currentUserId, "Chaves disponíveis:", encrypted_symmetric_keys.map(k => k.user_id));
        return "[Mensagem Criptografada - Chave Simétrica Ausente]";
      }
      console.log("DEBUG DECRYPT_CURRENT: Chave simétrica criptografada encontrada para o usuário atual:", encryptedKeyForCurrentUser.encrypted_key ? encryptedKeyForCurrentUser.encrypted_key.substring(0, 50) + "..." : "null");


      // Descriptografa a chave simétrica com a chave privada do usuário
      const decryptedSymmetricKey = decryptWithPrivateKey(
        encryptedKeyForCurrentUser.encrypted_key,
        currentUserPrivateKey
      );

      if (!decryptedSymmetricKey) {
        console.error("DEBUG DECRYPT_CURRENT: Falha na descriptografia da chave simétrica com a chave privada.");
        return "[Mensagem Criptografada - Falha na Descriptografia da Chave Simétrica]";
      }
      console.log("DEBUG DECRYPT_CURRENT: Chave simétrica descriptografada:", decryptedSymmetricKey);


      // Descriptografa o conteúdo da mensagem com a chave simétrica
      const decryptedBytes = CryptoJS.AES.decrypt(encrypted_content, decryptedSymmetricKey);
      const decryptedMessage = decryptedBytes.toString(CryptoJS.enc.Utf8);

      console.log("DEBUG DECRYPT_CURRENT: Mensagem final descriptografada:", decryptedMessage);
      return decryptedMessage || "[Mensagem Criptografada - Falha na Descriptografia]";

    } catch (e) {
      console.error("DEBUG DECRYPT_CURRENT: Erro ao descriptografar payload da mensagem:", e);
      return "[Mensagem Criptografada - Erro de Formato]";
    }
  };


  // Efeito para buscar detalhes da sala e mensagens
  useEffect(() => {
    if (!token || !roomId || !currentUserId) {
      console.log("DEBUG ROOM: Redirecionando devido a token/roomId/currentUserId ausente.");
      navigate('/');
      return;
    }

    const fetchRoomDetailsAndMessages = async () => {
      setLoading(true);
      setError(null);
      try {
        // 1. Buscar detalhes da sala (incluindo usuários e suas chaves públicas)
        const roomRes = await axios.get(`http://127.0.0.1:5000/rooms/${roomId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setRoom(roomRes.data);
        console.log("DEBUG ROOM: Detalhes da sala carregados:", roomRes.data);
        console.log("DEBUG ROOM: Usuários da sala carregados:", roomRes.data.users);

        // 2. Buscar mensagens da sala
        const messagesRes = await axios.get(`http://127.0.0.1:5000/messages/${roomId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setMessages(messagesRes.data);
        console.log("DEBUG ROOM: Mensagens carregadas:", messagesRes.data);

      } catch (err) {
        console.error("DEBUG ROOM: Erro ao carregar sala ou mensagens:", err);
        setError("Não foi possível carregar o chat. Verifique sua conexão ou tente novamente.");
        if (err.response && err.response.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('private_key');
          navigate('/login');
        } else if (err.response && err.response.status === 403) {
            setError("Você não tem permissão para acessar esta sala.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchRoomDetailsAndMessages();

    const interval = setInterval(fetchRoomDetailsAndMessages, 3000);
    return () => clearInterval(interval);
  }, [roomId, token, navigate, currentUserId, currentUserPrivateKey]);

  // Efeito para rolar para a última mensagem
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    console.log("DEBUG SEND: Tentando enviar mensagem...");
    console.log("DEBUG SEND: Nova mensagem:", newMessage.trim());
    console.log("DEBUG SEND: Sala atual:", room);
    console.log("DEBUG SEND: Usuários atuais na sala:", room?.users);

    if (!newMessage.trim() || !room || !room.users || room.users.length === 0) {
      console.warn("DEBUG SEND: Mensagem vazia ou sem usuários na sala para criptografar.");
      return;
    }

    if (!currentUserPrivateKey) {
        setError("Sua chave privada não está disponível. Não é possível enviar mensagens criptografadas.");
        console.error("DEBUG SEND: Chave privada ausente.");
        return;
    }

    try {
      const symmetricKey = generateSymmetricKey();
      console.log("DEBUG SEND: Chave simétrica gerada:", symmetricKey);
      const encryptedPayload = encryptMessageForRoom(
        newMessage,
        room.users,
        currentUserId,
        symmetricKey
      );

      if (!encryptedPayload) {
          setError("Falha na criptografia da mensagem. Verifique as chaves públicas dos usuários.");
          console.error("DEBUG SEND: Falha na criptografia do payload.");
          return;
      }
      console.log("DEBUG SEND: Payload criptografado FINAL para envio:", encryptedPayload);

      await axios.post('http://127.0.0.1:5000/messages', {
        room_id: roomId,
        message: encryptedPayload
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      console.log("DEBUG SEND: Mensagem enviada com sucesso para o backend.");
      setNewMessage('');
      // Recarrega as mensagens para ver a nova (ou adicione-a otimisticamente)
      const messagesRes = await axios.get(`http://127.0.0.1:5000/messages/${roomId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessages(messagesRes.data);

    } catch (err) {
      console.error("DEBUG SEND: Erro ao enviar mensagem:", err);
      setError("Não foi possível enviar a mensagem.");
      if (err.response && err.response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('private_key');
        navigate('/login');
      }
    }
  };

  if (loading) {
    return <div style={{ padding: '20px', textAlign: 'center' }}>Carregando sala...</div>;
  }

  if (error) {
    return <div style={{ padding: '20px', color: 'red', textAlign: 'center' }}>Erro: {error}</div>;
  }

  if (!room) {
    return <div style={{ padding: '20px', textAlign: 'center' }}>Sala não encontrada ou você não tem acesso.</div>;
  }

  return (
    <div style={{ maxWidth: '800px', margin: '20px auto', border: '1px solid #ccc', borderRadius: '8px', padding: '20px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '20px', color: '#333' }}>Sala: {room.name}</h2>
      <div style={{ height: '400px', overflowY: 'auto', border: '1px solid #eee', padding: '10px', borderRadius: '4px', backgroundColor: '#f9f9f9', marginBottom: '15px' }}>
        {messages.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#777' }}>Nenhuma mensagem ainda. Seja o primeiro a enviar!</p>
        ) : (
          messages.map((msg) => {
            const decryptedMessage = decryptMessageForCurrentUser(msg.mensagem);
            const isMyMessage = msg.autor === currentUserId;
            const authorUser = room.users.find(u => u.id === msg.autor);
            const authorName = authorUser ? authorUser.username : `Usuário ${msg.autor}`;

            return (
              <div
                key={msg.id}
                style={{
                  marginBottom: '10px',
                  padding: '8px 12px',
                  borderRadius: '15px',
                  backgroundColor: isMyMessage ? '#dcf8c6' : '#e0e0e0',
                  alignSelf: isMyMessage ? 'flex-end' : 'flex-start',
                  maxWidth: '70%',
                  wordWrap: 'break-word',
                  marginLeft: isMyMessage ? 'auto' : '0',
                  marginRight: isMyMessage ? '0' : 'auto',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                }}
              >
                <strong style={{ color: isMyMessage ? '#075e54' : '#333' }}>{isMyMessage ? 'Você' : authorName}: </strong>
                <span>{decryptedMessage}</span>
                <div style={{ fontSize: '0.7em', color: '#666', marginTop: '5px', textAlign: isMyMessage ? 'right' : 'left' }}>
                  {new Date(msg.criada_em).toLocaleString()}
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: '10px' }}>
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Digite sua mensagem..."
          style={{ flexGrow: 1, padding: '10px', borderRadius: '5px', border: '1px solid #ccc', fontSize: '1em' }}
        />
        <button
          type="submit"
          style={{ padding: '10px 20px', borderRadius: '5px', border: 'none', backgroundColor: '#007bff', color: 'white', cursor: 'pointer', fontSize: '1em' }}
        >
          Enviar
        </button>
      </form>
    </div>
  );
}
