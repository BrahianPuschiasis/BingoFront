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
        let letter = "";

        if (number >= 1 && number <= 15) {
          letter = "B";
        } else if (number >= 16 && number <= 30) {
          letter = "I";
        } else if (number >= 31 && number <= 45) {
          letter = "N";
        } else if (number >= 46 && number <= 60) {
          letter = "G";
        } else if (number >= 61 && number <= 75) {
          letter = "O";
        }

        const formattedNumber = `${letter}${number}`;
        setCurrentNumber(formattedNumber);
      }

      if (message.startsWith("Se terminó el juego")) {
        alert(message); 
        navigate("/home", { state: { username, token } });

        webSocket.send(`disconnect ${username}`);

        webSocket.close();
        setWebSocket(null);

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
      console.log("Tarjetón de Bingo generado al salir:", card);
      console.log("Números seleccionados al salir:", selectedNumbers);
  
      webSocket.send(`disconnect ${username}`);
      webSocket.close();
    }
    navigate("/");
  };
  

  const handleNumberClick = (number) => {
    const currentBallNumber = currentNumber
      ? currentNumber.replace(/[A-Z]/, "")
      : null;

    console.log(
      `Número clickado: ${number}, Número aleatorio: ${currentBallNumber}`
    );

    if (currentBallNumber && number === parseInt(currentBallNumber)) {
      setSelectedNumbers((prevSelectedNumbers) => {
        const newSelectedNumbers = [...prevSelectedNumbers, number];
        return newSelectedNumbers;
      });
    }
  };

  const checkVictory = (selectedNumbers) => {
    const winningLines = [
      // Filas
      [
        card.columnB[0],
        card.columnI[0],
        card.columnN[0],
        card.columnG[0],
        card.columnO[0],
      ],
      [
        card.columnB[1],
        card.columnI[1],
        card.columnN[1],
        card.columnG[1],
        card.columnO[1],
      ],
      [
        card.columnB[2],
        card.columnI[2],
        card.columnN[2],
        card.columnG[2],
        card.columnO[2],
      ],
      [
        card.columnB[3],
        card.columnI[3],
        card.columnN[3],
        card.columnG[3],
        card.columnO[3],
      ],
      [
        card.columnB[4],
        card.columnI[4],
        card.columnN[4],
        card.columnG[4],
        card.columnO[4],
      ],

      // Columnas
      card.columnB, // Columna B
      card.columnI, // Columna I
      card.columnN, // Columna N, incluyendo el "Free Space"
      card.columnG, // Columna G
      card.columnO, // Columna O

      // Diagonales
      [
        card.columnB[0],
        card.columnI[1],
        card.columnN[2],
        card.columnG[3],
        card.columnO[4],
      ],
      [
        card.columnB[4],
        card.columnI[3],
        card.columnN[2],
        card.columnG[1],
        card.columnO[0],
      ],
    ];

    return winningLines.some(
      (line) =>
        line.every((cell) => selectedNumbers.includes(cell) || cell === 0) // "Free Space" cuenta como seleccionado
    );
  };

  const handleBingoClick = async () => {
    const isWinner = checkVictory(selectedNumbers);
  
    console.log("Tarjetón de Bingo generado:", card);  // Muestra la tarjeta completa (columnas)
    console.log("Números seleccionados (coinciden con los aleatorios):", selectedNumbers);  // Muestra los números seleccionados por el usuario
  
    if (isWinner) {

      const data = {
        ganador: username,
        columnB: card.columnB,
        columnI: card.columnI,
        columnN: card.columnN,
        columnG: card.columnG,
        columnO: card.columnO,
        numerosGenerados: selectedNumbers,
      };
  
      try {
        const response = await fetch("http://localhost:8181/game", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        });
  
        if (!response.ok) {
          throw new Error("Error al guardar el ganador");
        }
        console.log("Ganador guardado correctamente");
      } catch (error) {
        console.error("Error al realizar el POST:", error);
      }



      webSocket.send(`Gano ${username}`);

      


      alert("¡Felicidades, ganaste!");
    } else {
      alert("No has ganado. Intenta de nuevo.");
    }
  
    webSocket.send(`disconnect ${username}`);
  
    webSocket.close();
    setWebSocket(null);
  
    navigate("/home", { state: { username, token } });
  };
  
  useEffect(() => {
    if (username && token) {
      connectWebSocket();
    }
  
    return () => {
      if (webSocket) {
        console.log("Tarjetón de Bingo generado al cerrar sesión:", card);
        console.log("Números seleccionados al cerrar sesión:", selectedNumbers);
  
        if (webSocket.readyState === WebSocket.OPEN) {
          webSocket.send(`disconnect ${username}`);
        }
        webSocket.close();
      }
    };
  }, [username, token]);
  

  return (
    <div className="partida-container">
      <div className="current-number">
        {currentNumber ? <h2>{currentNumber}</h2> : <p>Esperando número...</p>}
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

      <button onClick={handleBingoClick} className="bingo-button">
        Bingo!
      </button>

      <button onClick={handleLogout} className="logout-button">
        Logout
      </button>
    </div>
  );
}

export default Partida;
