/* eslint-disable no-unused-vars */
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import '../style/Home.css'; 

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
    <div className="home-container">
      <div className="home-box">
        <h2 className="welcome-message">Bienvenido, {username}</h2>
        <div className="button-container">
          <button className="start-btn" onClick={handleStartGame}>
            Iniciar Juego
          </button>
          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}

export default Home;
