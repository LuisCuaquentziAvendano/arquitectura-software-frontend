import { useEffect, useState } from "react";
import axios, { AxiosError } from "axios";
import { useNavigate } from 'react-router-dom';
import { API_URL, formatError } from "../utils";
import Header from "../Header";
import "./index.css";

const CellState = {
    HIDDEN: "HIDDEN",
    REVEALED: "REVEALED",
    FLAGGED: "FLAGGED",
} as const;

type CellState = typeof CellState[keyof typeof CellState];

interface Cell {
    isMine: boolean;
    neighborMines: number;
    state: CellState;
}

interface MinesweeperGame {
    board: Cell[][];
    isEndOfGame: boolean;
    isWin: boolean;
}

const Minesweeper = () => {
    const authorization = localStorage.getItem("authorization");
    const navigate = useNavigate();
    const [game, setGame] = useState<MinesweeperGame>({
        board: Array.from({ length: 8 }, () =>
            Array.from({ length: 8 }, () => ({
                isMine: false,
                neighborMines: 0,
                state: CellState.HIDDEN,
            }))
        ),
        isEndOfGame: false,
        isWin: false,
    });
    const [loading, setLoading] = useState(true);
    const [startTime, setStartTime] = useState<number | null>(null);
    const [elapsed, setElapsed] = useState<number>(0);

    useEffect(() => {
        if (!authorization) return;
        setLoading(true);
        axios
            .post(`${API_URL}/minesweeper/start-game`, undefined, {
                headers: { Authorization: authorization },
            })
            .then((res) => {
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

    // actulizar el timer
    useEffect(() => {
        if (!startTime || game.isEndOfGame) return;
        const timer = setInterval(() => {
            setElapsed(Math.floor((Date.now() - startTime) / 1000));
        }, 1000);
        return () => clearInterval(timer);
    }, [startTime, game.isEndOfGame]);

    const handleLeftClick = (row: number, col: number) => {
        if (game.isEndOfGame) return;
        const cell = game.board[row][col];
        if (cell.state !== CellState.HIDDEN) return;

        axios
            .post(
                `${API_URL}/minesweeper/play-turn`,
                { row, col },
                { headers: { Authorization: authorization } }
            )
            .then((res) => {
                setGame(res.data);
            })
            .catch((err: AxiosError) => {
                formatError(err);
            });
    };

    const handleRightClick = (
        e: React.MouseEvent,
        row: number,
        col: number
    ) => {
        e.preventDefault();
        if (game.isEndOfGame) return;
        const cell = game.board[row][col];
        if (cell.state === CellState.REVEALED) return;

        axios
            .post(
                `${API_URL}/minesweeper/flag`,
                { row, col },
                { headers: { Authorization: authorization } }
            )
            .then((res) => {
                setGame(res.data);
            })
            .catch((err: AxiosError) => {
                formatError(err);
            });
    };

    // renderizar celdas
    const renderCell = (cell: Cell, row: number, col: number) => {
        let content = "";
        let className = "minesweeper-cell";

        if (cell.state === CellState.HIDDEN) {
            className += " hidden";
        } else if (cell.state === CellState.FLAGGED) {
            className += " flagged";
            content = "🚩";
        } else if (cell.state === CellState.REVEALED) {
            className += " revealed";
            if (cell.isMine) {
                content = "💣";
                className += " mine";
            } else if (cell.neighborMines > 0) {
                content = cell.neighborMines.toString();
                className += ` number-${cell.neighborMines}`;
            }
        }

        return (
            <button
                key={`${row}-${col}`}
                className={className}
                onClick={() => handleLeftClick(row, col)}
                onContextMenu={(e) => handleRightClick(e, row, col)}
                disabled={game.isEndOfGame && cell.state !== CellState.REVEALED}
            >
                {content}
            </button>
        );
    };

    if (loading) return <div>Loading Minesweeper...</div>;

    const mineCount = game.board.flat().filter((c) => c.isMine).length;
    const flagCount = game.board.flat().filter((c) => c.state === CellState.FLAGGED).length;

    return (
        <div className="main-container vertical-flex">
            <Header />
            <button className="back-button" onClick={() => navigate('/games')}>←</button>

            <div className="minesweeper-info">
                <span>💣 Minas: {mineCount}</span>
                <span>🚩 Banderas: {flagCount}</span>
                <span>⏱️ Tiempo: {elapsed}s</span>
            </div>

            <div className="minesweeper-container">
                {game.board.map((row, rowIndex) => (
                    <div key={rowIndex} className="minesweeper-row">
                        {row.map((cell, colIndex) => renderCell(cell, rowIndex, colIndex))}
                    </div>
                ))}
            </div>

            {game.isEndOfGame && (
                <div className="minesweeper-end">
                    {game.isWin
                        ? `Ganaste en ${elapsed} segundos.`
                        : "💥 Has perdido."}
                </div>
            )}
        </div>
    );
};

export default Minesweeper;