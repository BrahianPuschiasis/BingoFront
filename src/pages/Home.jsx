/* eslint-disable no-unused-vars */
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

function Home() {
  const { state } = useLocation();
  const { username, token } = state || {};
  const navigate = useNavigate();

  const handleStartGame = () => {
    navigate('/sala', { state: { username, token } });
  };

  const handleLogout = () => {
    navigate('/');
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial' }}>
      <h2>Bienvenido, {username}</h2>
      <button onClick={handleStartGame}>Iniciar Juego</button>
      <button onClick={handleLogout} style={{ marginLeft: '10px' }}>Logout</button>
    </div>
  );
}

export default Home;
