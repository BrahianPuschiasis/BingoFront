/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import axios from "axios";
import "../style/History.css"; 

function History() {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGames = async () => {
      try {
        const response = await axios.get("http://localhost:8181/game");
        setGames(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error al cargar los juegos:", error);
        setLoading(false);
      }
    };

    fetchGames();
  }, []);

  if (loading) return <div>Loading...</div>;

  const isNumberGenerated = (num, numerosGenerados) => numerosGenerados.includes(num);

  return (
    <div className="history-wrapper">
      {games.map((game) => (
        <div key={game.id}>
          <div className="history-header">
            <h1>Ganador: {game.ganador}</h1>
            <div className="history-room-number">Sala: {game.id}</div>
          </div>
          <div className="history-bingo-card-container">
            <div className="history-column-container">
              <h3>B</h3>
              {game.columnB.map((num) => (
                <div
                  key={num}
                  className={`history-cell-container ${isNumberGenerated(num, game.numerosGenerados) ? "highlight" : ""}`}
                >
                  {num}
                </div>
              ))}
            </div>
            <div className="history-column-container">
              <h3>I</h3>
              {game.columnI.map((num) => (
                <div
                  key={num}
                  className={`history-cell-container ${isNumberGenerated(num, game.numerosGenerados) ? "highlight" : ""}`}
                >
                  {num}
                </div>
              ))}
            </div>
            <div className="history-column-container">
              <h3>N</h3>
              {game.columnN.map((num) => (
                <div
                  key={num}
                  className={`history-cell-container ${isNumberGenerated(num, game.numerosGenerados) ? "highlight" : ""}`}
                >
                  {num === 0 ? "Free" : num}
                </div>
              ))}
            </div>
            <div className="history-column-container">
              <h3>G</h3>
              {game.columnG.map((num) => (
                <div
                  key={num}
                  className={`history-cell-container ${isNumberGenerated(num, game.numerosGenerados) ? "highlight" : ""}`}
                >
                  {num}
                </div>
              ))}
            </div>
            <div className="history-column-container">
              <h3>O</h3>
              {game.columnO.map((num) => (
                <div
                  key={num}
                  className={`history-cell-container ${isNumberGenerated(num, game.numerosGenerados) ? "highlight" : ""}`}
                >
                  {num}
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default History;
