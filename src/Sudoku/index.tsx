import { useEffect, useState } from "react";
import axios, { AxiosError } from "axios";
import { useNavigate } from "react-router-dom";
import { API_URL, formatError } from "../utils";
import Header from "../Header";
import "./index.css";

interface CellObject {
  row?: number;
  col?: number;
  value: number | null;
  editable?: boolean; 
}

type Cell = number | null | CellObject;

interface SudokuGame {
  board: Cell[][];
  isEndOfGame: boolean;
  valid?: boolean;
}

const Sudoku = () => {
  const authorization = localStorage.getItem("authorization");
  const navigate = useNavigate();
  const [game, setGame] = useState<SudokuGame>({
    board: Array.from({ length: 9 }, () => Array(9).fill(null)),
    isEndOfGame: false,
  });
  const [loading, setLoading] = useState(true);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsed, setElapsed] = useState<number>(0);

  // --- Start Sudoku game ---
  useEffect(() => {
    if (!authorization) return;
    setLoading(true);
    axios
      .post(`${API_URL}/sudoku/start-game`, undefined, {
        headers: { Authorization: authorization },
      })
      .then((res) => {
        // ensure board is present
        const payload = res.data;
        if (!payload || !payload.board) {
          throw new Error("Invalid game payload");
        }
        setGame(payload);
        setStartTime(Date.now());
      })
      .catch((err: AxiosError | Error) => {
        formatError(err as AxiosError);
      })
      .finally(() => setLoading(false));
  }, [authorization]);

  // --- Update timer every second ---
  useEffect(() => {
    if (!startTime || game.isEndOfGame) return;
    const timer = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    return () => clearInterval(timer);
  }, [startTime, game.isEndOfGame]);

  // --- Submit move to backend ---
  const playMove = (row: number, col: number, value: number) => {
    if (game.isEndOfGame) return;
    if (value < 1 || value > 9) {
      alert("Enter a number between 1 and 9");
      return;
    }

    axios
      .post(
        `${API_URL}/sudoku/validate-move`,
        { row, col, value },
        { headers: { Authorization: authorization } },
      )
      .then(async (res) => {
        if (res.data.valid) {
          // Update board carefully depending on cell shape
          const updated = structuredClone(game);
          const currentCell = updated.board[row][col];

          if (currentCell === null || typeof currentCell === "number") {
            // primitive shape: replace with number
            updated.board[row][col] = value;
          } else {
            // object shape: update value and mark non-editable if server applied it
            (updated.board[row][col] as CellObject).value = value;
            // ensure editable flag reflects applied move
            (updated.board[row][col] as CellObject).editable = false;
          }

          // If server says completed, set it
          if (res.data.completed) {
            updated.isEndOfGame = true;
            setGame(updated);
            await handleGameCompleted();
          } else {
            setGame(updated);
          }
        } else {
          // server rejected move
          alert("Invalid move");
        }
      })
      .catch((err: AxiosError) => {
        formatError(err);
      });
  };

  // --- When player completes Sudoku ---
  const handleGameCompleted = async () => {
    if (!authorization || !startTime) return;
    const totalTime = Math.floor((Date.now() - startTime) / 1000);
    setElapsed(totalTime);
  };

  // --- Render single cell ---
  const getCellValue = (cell: any): number | null => {
    if (cell === null) return null;
    if (typeof cell === "number") return cell;
    return cell?.value ?? null;
  };

  const isCellFixed = (cell: any): boolean => {
    if (cell === null) return false;
    if (typeof cell === "number") return true; // raw prefilled
    if (typeof cell.editable === "boolean") return !cell.editable;
    return cell.value !== null && cell.value !== undefined;
  };

  const renderCell = (cell: any, row: number, col: number) => {
    const value = getCellValue(cell);
    const fixed = isCellFixed(cell);

    return (
      <input
        key={`${row}-${col}`}
        type="text"
        inputMode="numeric"
        pattern="[1-9]"
        maxLength={1}
        disabled={game.isEndOfGame || fixed}
        value={value ?? ""}
        onChange={(e) => handleInput(row, col, e)}
        className={`sudoku-cell ${fixed ? "fixed" : ""}`}
      />
    );
  };

  // handleInput: limpia entrada y envía número al servidor (no mutar UI localmente con objetos)
  const handleInput = (row: number, col: number, event: React.ChangeEvent<HTMLInputElement>) => {
    const raw = event.target.value.replace(/[^0-9]/g, "");
    if (raw === "") return;
    const val = parseInt(raw, 10);
    if (!isNaN(val)) {
      playMove(row, col, val);
      // clear visual input. UI will be updated by server response.
      event.target.value = "";
    }
  };

  if (loading) return <div>Loading Sudoku...</div>;

  return (
    <div className="main-container vertical-flex">
      <Header />
      <button className="back-button" onClick={() => navigate("/games")}>←</button>
      <div className="sudoku-info">
        <span>⏱️ Tiempo: {elapsed}s</span>
      </div>

      <div className="sudoku-container vertical-flex">
        {game.board.map((row, rowIndex) => (
          <div key={rowIndex} className="sudoku-row horizontal-flex">
            {row.map((cell, colIndex) => renderCell(cell, rowIndex, colIndex))}
          </div>
        ))}
      </div>

      {game.isEndOfGame && (
        <div className="sudoku-end">
          🎉 ¡Felicidades! Has completado el Sudoku en {elapsed} segundos.
          <button className="play-again-button" onClick={() => navigate(0)}>Jugar de Nuevo</button>
        </div>
      )}
    </div>
  );
};

export default Sudoku;
