import { useEffect, useState } from "react";
import axios, { AxiosError } from "axios";
import { API_URL, formatError } from "../utils";
import "./index.css";

interface ThreeInARowGame {
  board: number[][];
  isEndOfGame: boolean;
  winningBoxes: number[][];
}

const EMPTY = 0;
const USER = 1;
const SERVER = 2;

function ThreeInARow() {
  const authorization = localStorage.getItem("authorization");
  const [game, setGame] = useState<ThreeInARowGame>({
    board: [[0, 0, 0], [0, 0, 0], [0, 0, 0]],
    isEndOfGame: false,
    winningBoxes: [],
  });
  const [boxesBlocked, setBoxesBlocked] = useState(false);

  useEffect(() => {
    if (!authorization)
      return;
    axios.post(
      `${API_URL}/three-in-a-row/start-game`,
      undefined,
      { headers: { authorization } },
    ).then(res => {
      setGame(res.data);
    }).catch((res: AxiosError) => {
      formatError(res);
    });
  }, [authorization]);

  const renderBox = (value: number) => {
    if (value == USER) return <img src="/user.jpg" alt="user" />;
    if (value == SERVER) return <img src="/robot.jpg" alt="robot" />;
    return '';
  };

  const playTurn = (row: number, col: number) => {
    if (game.board[row][col] != EMPTY) {
      alert('Position on the board occupied');
      return;
    }
    setBoxesBlocked(true);
    const gameUpdated = JSON.parse(JSON.stringify(game));
    gameUpdated.board[row][col] = USER;
    setGame({ ...gameUpdated });
    axios.post(
      `${API_URL}/three-in-a-row/play-user-turn`,
      { row, col },
      { headers: { authorization } },
    ).then(res => {
      setTimeout(() => {
        setGame(res.data);
        setBoxesBlocked(false);
      }, 2000);
    }).catch((res: AxiosError) => {
      formatError(res);
    });
  }

  const endOfGameMessage = () => {
    if (game.winningBoxes.length == 0)
      return '🎉 ¡Bien hecho! Has empatado';
    const [row, col] = game.winningBoxes[0];
    if (game.board[row][col] == USER)
      return '🎉 ¡Excelente! Has ganado';
    return 'Sigue practicando, el robot ha ganado'
  }

  return (
    <div className="main-container vertical-flex">
      <div className="boxes-container vertical-flex">
        {game.board.map((row, rowIndex) => (
          <div key={rowIndex} className="row horizontal-flex">
            {row.map((cell, colIndex) => {
              const isEmpty = game.board[rowIndex][colIndex] == EMPTY;
              const isWinning = game.winningBoxes.find(box => box[0] == rowIndex && box[1] == colIndex);
              return (
                <button
                  key={colIndex}
                  onClick={() => playTurn(rowIndex, colIndex)}
                  disabled={game.isEndOfGame || boxesBlocked || !isEmpty}
                  className={`${isWinning ? 'highlight' : ''} ${!game.isEndOfGame && !boxesBlocked && isEmpty  ? 'active' : ''}`}
                >
                  {renderBox(cell)}
                </button>
              );
            })}
          </div>
        ))}
      </div>
      {game.isEndOfGame && (
        <div>{endOfGameMessage()}</div>
      )}
    </div>
  );
}

export default ThreeInARow;
