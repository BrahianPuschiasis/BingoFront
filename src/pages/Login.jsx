import React, { useState, useEffect } from 'react';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [token, setToken] = useState(null);
  const [error, setError] = useState('');
  const [webSocket, setWebSocket] = useState(null);
  const [connectedUsers, setConnectedUsers] = useState([]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const params = new URLSearchParams();
    params.append('client_id', 'bingo-backEnd');
    params.append('client_secret', 'KAYxA2v8YYmswj6NgtJXe8kFKPk5TlGi');
    params.append('scope', 'openid');
    params.append('username', username);
    params.append('password', password);
    params.append('grant_type', 'password');

    try {
      const response = await fetch('http://localhost:8080/realms/bingo/protocol/openid-connect/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params,
      });

      if (!response.ok) {
        throw new Error('Error al autenticar al usuario');
      }

      const data = await response.json();
      setToken(data.access_token);
      setError('');
    } catch (err) {
      setError('Error al autenticar al usuario: ' + err.message);
      setToken(null);
    }
  };

  const connectWebSocket = (username) => {
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
    setToken(null);
    setUsername('');
    setPassword('');
    setConnectedUsers([]); 
  };

  useEffect(() => {
    if (token && username) {
      connectWebSocket(username); 
    }

    return () => {
      if (webSocket) {
        webSocket.close();
      }
    };
  }, [token, username]); 

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial' }}>
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Username:</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit">Login</button>
      </form>

      {error && <div style={{ color: 'red' }}>{error}</div>}

      {token && (
        <div>
          <h3>Token de Acceso:</h3>
          <p>{token}</p>
        </div>
      )}

      <div>
        <h3>Usuarios Conectados:</h3>
        <ul>
          {connectedUsers.map((user, index) => (
            <li key={index}>{user}</li>
          ))}
        </ul>
      </div>

      {token && (
        <div>
          <button onClick={handleLogout}>Logout</button>
        </div>
      )}
    </div>
  );
}

export default Login;
