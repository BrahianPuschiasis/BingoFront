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
  const [selectedNumbers, setSelectedNumbers] = useState([]);
  const { state } = useLocation();
  const { username, token } = state || {};
  const navigate = useNavigate();

  const connectWebSocket = () => {
    const ws = new WebSocket(`ws://localhost:8181/ws?username=${username}`);

    ws.onopen = () => {
      console.log("WebSocket conectado");
      setWebSocket(ws);
      ws.send("crear tarjeta");
    };

    ws.onmessage = (event) => {
      const message = event.data;
      console.log("Mensaje recibido:", message);

      if (message.startsWith("Tarjeton:")) {
        try {
          const cardData = JSON.parse(message.replace("Tarjeton:", ""));
          console.log("Tarjetón recibido:", cardData);
          setCard(cardData);
        } catch (error) {
          console.error("Error al parsear el mensaje:", error);
        }
      }

      if (message.startsWith("Usuarios conectados:")) {
        const users = message
          .replace("Usuarios conectados: ", "")
          .split(", ")
          .filter((user) => user);
        setConnectedUsers(users);
      }

      if (message.startsWith("Número generado:")) {
        let number = message.replace("Número generado: ", "");
        let letter = '';

        if (number >= 1 && number <= 15) {
          letter = 'B';
        } else if (number >= 16 && number <= 30) {
          letter = 'I';
        } else if (number >= 31 && number <= 45) {
          letter = 'N';
        } else if (number >= 46 && number <= 60) {
          letter = 'G';
        } else if (number >= 61 && number <= 75) {
          letter = 'O';
        }

        const formattedNumber = `${letter}${number}`;
        setCurrentNumber(formattedNumber);
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

  const startGame = () => {
    if (webSocket && !gameStarted) {
      webSocket.send("iniciar juego");
      setGameStarted(true);
    }
  };

  const handleNumberClick = (number) => {
    const currentBallNumber = currentNumber ? currentNumber.replace(/[A-Z]/, '') : null;

    console.log(`Número clickado: ${number}, Número aleatorio: ${currentBallNumber}`);

    if (currentBallNumber && number === parseInt(currentBallNumber)) {
      setSelectedNumbers((prevSelectedNumbers) => [
        ...prevSelectedNumbers,
        number,
      ]);
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
      <div className="current-number">
        {currentNumber ? (
          <h2>{currentNumber}</h2>
        ) : (
          <p>Esperando número...</p>
        )}
      </div>

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
                      <div
                        key={rowIndex}
                        className={`bingo-cell ${
                          selectedNumbers.includes(num) ? "selected" : ""
                        }`}
                        onClick={() => handleNumberClick(num)}
                      >
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

      <button onClick={startGame} className="start-game-button" disabled={gameStarted}>
        {gameStarted ? "Juego Comenzado" : "Iniciar Juego"}
      </button>

      <button onClick={handleLogout} className="logout-button">
        Logout
      </button>
    </div>
  );
}

export default Partida;
