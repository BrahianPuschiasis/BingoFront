/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

function Sala() {
  const [webSocket, setWebSocket] = useState(null);
  const [connectedUsers, setConnectedUsers] = useState([]);
  const [error, setError] = useState('');
  const { state } = useLocation();
  const { username, token } = state || {};
  const navigate = useNavigate();

  const connectWebSocket = () => {
    const ws = new WebSocket(`ws://localhost:8181/ws?username=${username}`);

    ws.onopen = () => {
      console.log('WebSocket conectado');
      setWebSocket(ws);
      ws.send(username);
    };

    ws.onmessage = (event) => {
      const message = event.data;
      console.log('Mensaje recibido:', message);

      if (message.startsWith('Usuarios conectados:')) {
        const users = message.replace('Usuarios conectados: ', '').split(', ').filter(user => user);
        setConnectedUsers(users);
      }
    };

    ws.onerror = (error) => {
      console.error('Error en WebSocket: ', error);
      setError('Error en la conexión WebSocket');
    };

    ws.onclose = () => {
      console.log('WebSocket desconectado');
      setWebSocket(null);
      setConnectedUsers([]);
    };
  };

  const handleLogout = () => {
    if (webSocket) {
      webSocket.close();
    }
    navigate('/');
  };

  const handleCreateCard = () => {
    navigate('/partida', { state: { username, token, connectedUsers } });
  };

  useEffect(() => {
    if (username && token) {
      connectWebSocket();
    }

    return () => {
      if (webSocket) {
        webSocket.close();
      }
    };
  }, [username, token]);

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial' }}>
      <h2>Bienvenido a la Sala, {username}</h2>
      <h3>Usuarios Conectados:</h3>
      <ul>
        {connectedUsers.map((user, index) => (
          <li key={index}>{user}</li>
        ))}
      </ul>

      {error && <div style={{ color: 'red' }}>{error}</div>}

      <button onClick={handleCreateCard}>Crear Tarjetón</button>
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
}

export default Sala;
