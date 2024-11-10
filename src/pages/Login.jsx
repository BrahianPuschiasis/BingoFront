/* eslint-disable no-unused-vars */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../style/Login.css'; 

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

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
      setError('');
      navigate('/home', { state: { username: username, token: data.access_token } });

    } catch (err) {
      setError('Error al autenticar al usuario: ' + err.message);
    }
  };

  const handleSignupRedirect = () => {
    navigate('/signup'); 
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2>Login</h2>
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label>Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="input-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="submit-btn">Login</button>
        </form>

        {error && <div className="error-message">{error}</div>}

        <button onClick={handleSignupRedirect} className="submit-btn">Signup</button> 
      </div>
    </div>
  );
}

export default Login;
