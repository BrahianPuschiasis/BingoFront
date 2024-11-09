/* eslint-disable no-unused-vars */

import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../style/Partida.css";

function Partida() {
  const [webSocket, setWebSocket] = useState(null);
  const [card, setCard] = useState({
    columnB: [],
    columnI: [],
    columnN: [],
    columnG: [],
    columnO: [],
  });
  const [connectedUsers, setConnectedUsers] = useState([]);
  const [currentNumber, setCurrentNumber] = useState(null); 
  const [gameStarted, setGameStarted] = useState(false); 
  const { state } = useLocation();
  const { username, token } = state || {};
  const navigate = useNavigate();

  const connectWebSocket = () => {
    const ws = new WebSocket(`ws://localhost:8181/ws?username=${username}`);

    ws.onopen = () => {
      console.log("WebSocket conectado");
      setWebSocket(ws);
      ws.send("crear tarjeta"); // Solicitar la creación de la tarjeta
    };

    ws.onmessage = (event) => {
      const message = event.data;
      console.log("Mensaje recibido:", message);

      // Manejar la tarjeta de bingo
      if (message.startsWith("Tarjeton:")) {
        try {
          const cardData = JSON.parse(message.replace("Tarjeton:", ""));
          console.log("Tarjetón recibido:", cardData);
          setCard(cardData);
        } catch (error) {
          console.error("Error al parsear el mensaje:", error);
        }
      }

      // Manejar los usuarios conectados
      if (message.startsWith("Usuarios conectados:")) {
        const users = message
          .replace("Usuarios conectados: ", "")
          .split(", ")
          .filter((user) => user);
        setConnectedUsers(users);
      }

      // Manejar el número generado
      if (message.startsWith("Número generado:")) {
        const number = message.replace("Número generado: ", "");
        setCurrentNumber(number);
      }
    };

    ws.onerror = (error) => {
      console.error("Error en WebSocket: ", error);
    };

    ws.onclose = () => {
      console.log("WebSocket desconectado");
      setWebSocket(null);
    };

    setWebSocket(ws);
  };

  const handleLogout = () => {
    if (webSocket) {
      webSocket.send(`${username} ha salido`);
      webSocket.close();
    }
    navigate("/"); 
  };

  // Función para iniciar el juego
  const startGame = () => {
    if (webSocket && !gameStarted) {
      webSocket.send("iniciar juego"); 
      setGameStarted(true); 
    }
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
    <div className="partida-container">
      {/* Mostrar el número actual */}
      <div className="current-number">
        {currentNumber ? (
          <h2>{currentNumber}</h2>
        ) : (
          <p>Esperando número...</p>
        )}
      </div>

      {/* Mostrar los usuarios conectados */}
      <div className="connected-users">
        <h3>Usuarios Conectados:</h3>
        <ul>
          {connectedUsers.length > 0 ? (
            connectedUsers.map((user, index) => <li key={index}>{user}</li>)
          ) : (
            <li>No hay usuarios conectados</li>
          )}
        </ul>
      </div>

      {/* Mostrar la tarjeta de bingo */}
      <div className="bingo-card-container">
        {card && Object.keys(card).length > 0 ? (
          <div className="bingo-card">
            <div className="bingo-header">
              {["B", "I", "N", "G", "O"].map((letter, index) => (
                <div key={index} className="bingo-column-header">
                  {letter}
                </div>
              ))}
            </div>
            <div className="bingo-body">
              {["columnB", "columnI", "columnN", "columnG", "columnO"].map(
                (col, index) => (
                  <div key={index} className="bingo-column">
                    {card[col].map((num, rowIndex) => (
                      <div key={rowIndex} className="bingo-cell">
                        {num === 0 ? "FREE" : num}
                      </div>
                    ))}
                  </div>
                )
              )}
            </div>
          </div>
        ) : (
          <p>Cargando tarjetón...</p>
        )}
      </div>

      {/* Botón para iniciar el juego */}
      <button onClick={startGame} className="start-game-button" disabled={gameStarted}>
        {gameStarted ? "Juego Comenzado" : "Iniciar Juego"}
      </button>

      {/* Botón de Logout */}
      <button onClick={handleLogout} className="logout-button">
        Logout
      </button>
    </div>
  );
}

export default Partida;
