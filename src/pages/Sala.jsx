/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

function Sala() {
  const [webSocket, setWebSocket] = useState(null);
  const [connectedUsers, setConnectedUsers] = useState([]);
  const [countdown, setCountdown] = useState(0); 
  const [error, setError] = useState('');
  const { state } = useLocation();
  const { username, token } = state || {};
  const navigate = useNavigate();

  const connectWebSocket = () => {
    const ws = new WebSocket(`ws://localhost:8181/ws?username=${username}`);

    ws.onopen = () => {
      console.log('WebSocket conectado');
      setWebSocket(ws);

 
      ws.send('start countdown');
    };

    ws.onmessage = (event) => {
      const message = event.data;
      console.log('Mensaje recibido:', message);

      if (message.startsWith('Usuarios conectados:')) {
        const users = message.replace('Usuarios conectados: ', '').split(', ').filter(user => user);
        setConnectedUsers(users);
      }

      if (message.startsWith('Tiempo:')) {
        const timeLeft = parseInt(message.replace('Tiempo: ', '').replace(' segundos', ''), 10);
        setCountdown(timeLeft); 
      }

      if (message === '¡El juego ha comenzado!') {
        navigate('/partida', { state: { username, token, connectedUsers } });
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

      <div style={{ marginTop: '20px' }}>
        {countdown > 0
          ? <p>Esperando rivales... {countdown} segundos</p>
          : <p>¡Ya estamos listos para jugar!</p>
        }
      </div>

      {error && <div style={{ color: 'red' }}>{error}</div>}

      <button onClick={handleLogout}>Logout</button>
    </div>
  );
}

export default Sala;
