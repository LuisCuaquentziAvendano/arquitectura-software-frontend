import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios, { AxiosError } from "axios";
import { API_URL, formatError } from "../utils";
import Header from "../Header";
import "./index.css";

interface WordsearchGame {
  board: string[][];
  words: string[];
  foundWords: string[];
  isEndOfGame: boolean;
  foundCoords: [number, number][];
  isUserWinner: boolean;
}

function Wordsearch() {
  const authorization = localStorage.getItem("authorization");
  const navigate = useNavigate();
  const [game, setGame] = useState<WordsearchGame>({
    board: [],
    words: [],
    foundWords: [],
    foundCoords: [],
    isEndOfGame: false,
    isUserWinner: false,
  });

  const [selectedWord, setSelectedWord] = useState<string>("");
  const [selectedCoords, setSelectedCoords] = useState<[number, number][]>([]);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsed, setElapsed] = useState<number>(0);

  useEffect(() => {
    if (!authorization) return;
    axios
      .post(`${API_URL}/wordsearch/start-game`, undefined, {
        headers: { authorization },
      })
      .then((res) => {
        setGame(res.data);
        setStartTime(Date.now());
      })
      .catch((res: AxiosError) => formatError(res));
  }, [authorization]);

  useEffect(() => {
    if (!startTime || game.isEndOfGame) return;
    const timer = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    return () => clearInterval(timer);
  }, [startTime, game.isEndOfGame]);

  const handleCellClick = (row: number, col: number) => {
    if (game.isEndOfGame) return;

    if (selectedCoords.length === 0) {
      setSelectedCoords([[row, col]]);
      setSelectedWord(game.board[row][col]);
      return;
    }

    if (selectedCoords.some(([r, c]) => r === row && c === col)) return;

    const [lastRow, lastCol] = selectedCoords[selectedCoords.length - 1];
    const isAdjacent =
      Math.abs(row - lastRow) <= 1 && Math.abs(col - lastCol) <= 1;

    if (!isAdjacent) return;

    const newCoords: [number, number][] = [...selectedCoords, [row, col]];
    const newWord = selectedWord + game.board[row][col];

    setSelectedCoords(newCoords);
    setSelectedWord(newWord);
  };

  const confirmWord = () => {
    if (!authorization || selectedWord.length === 0) return;

    axios
      .post(
        `${API_URL}/wordsearch/select-word`,
        { word: selectedWord },
        { headers: { authorization } }
      )
      .then((res) => {
        setGame(res.data);
        setSelectedCoords([]);
        setSelectedWord("");
      })
      .catch((res: AxiosError) => {
        formatError(res);
        setSelectedCoords([]);
        setSelectedWord("");
      });
  };

  const endOfGameMessage = () => {
    if (!game.isEndOfGame) return "";
    return game.isUserWinner
      ? `🎉 ¡Encontraste todas las palabras en ${elapsed} segundos!`
      : "Fin del juego. Intenta nuevamente.";
  };

  // número de columnas del tablero (0 si no hay)
  const numCols = game.board.length > 0 ? game.board[0].length : 0;
  // aplanamos el tablero a una sola lista para renderizar en un grid único
  const flatCells = game.board.flat();

  return (
    <div className="main-container vertical-flex">
      <Header />
      <button className="back-button" onClick={() => navigate('/games')}>←</button>
      <div className="wordsearch-info">
        <span>⏱️ Tiempo: {elapsed}s</span>
        <span>
          📝 Encontradas: {game.foundWords.length}/{game.words.length}
        </span>
      </div>

      <div className="wordsearch-container vertical-flex">
        {game.board.length > 0 && (
          <div
            className="board-wrapper"
            /* pasamos la cantidad de columnas al CSS vía variable */
            style={
              {
                // CSS custom properties que usa el css
                ["--cols" as any]: numCols,
                ["--cell-min" as any]: "36px",
                ["--cell-max" as any]: "48px",
              } as React.CSSProperties
            }
          >
            <div
              className="board"
              /* también seteamos gridTemplateColumns inline para soporte robusto */
              style={
                {
                  gridTemplateColumns: numCols
                    ? `repeat(${numCols}, minmax(var(--cell-min), 1fr))`
                    : undefined,
                } as React.CSSProperties
              }
            >
              {flatCells.map((letter, index) => {
                const row = Math.floor(index / (numCols || 1));
                const col = index % (numCols || 1);
                const isSelected = selectedCoords.some(
                  ([r, c]) => r === row && c === col
                );
                const isFound = game.foundCoords.some(
                  ([r, c]) => r === row && c === col
                );
                return (
                  <button
                    key={`${row}-${col}`}
                    className={`cell ${isSelected ? "selected" : ""} ${
                      isFound ? "found" : ""
                    }`}
                    onClick={() => handleCellClick(row, col)}
                    disabled={game.isEndOfGame}
                    aria-label={`cell-${row}-${col}`}
                  >
                    {letter.toUpperCase()}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div className="words-list">
          <h3>Palabras por encontrar:</h3>
          <div className="words-container">
            {game.words.map((word, i) => (
              <span
                key={i}
                className={
                  game.foundWords.includes(word) ? "found-word" : "pending-word"
                }
              >
                {word.toUpperCase()}
              </span>
            ))}
          </div>
        </div>

        {selectedWord && (
          <div className="selected-word">
            <p>Palabra seleccionada: {selectedWord.toUpperCase()}</p>
            <div className="buttonGrouping">
              <button onClick={confirmWord}>Confirmar</button>
              <button
                onClick={() => {
                  setSelectedWord("");
                  setSelectedCoords([]);
                }}
              >
                Cancelar
              </button>
            </div>
          </div>
        )}

        {game.isEndOfGame && <div className="end-message">{endOfGameMessage()}</div>}
      </div>
    </div>
  );
}

export default Wordsearch;
