import { useEffect, useState } from "react";
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

    // 🔹 Inicia el juego al cargar
    useEffect(() => {
        if (!authorization) return;
        axios
            .post(`${API_URL}/wordsearch/start-game`, undefined, {
                headers: { authorization },
            })
            .then((res) => {
                setGame(res.data);
            })
            .catch((res: AxiosError) => formatError(res));
    }, [authorization]);

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

        if (!isAdjacent) {
            return;
        }
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
            ? "Encontraste todas las palabras."
            : "Fin del juego. Intenta nuevamente.";
    };

    const renderCell = (row: number, col: number, value: string) => {
        const isSelected = selectedCoords.some(([r, c]) => r === row && c === col);
        const isFound = game.foundCoords.some(([r, c]) => r === row && c === col);

        return (
            <button
                key={`${row}-${col}`}
                className={`cell ${isSelected ? "selected" : ""} ${isFound ? "found" : ""
                    }`}
                onClick={() => handleCellClick(row, col)}
                disabled={game.isEndOfGame}
            >
                {value.toUpperCase()}
            </button>
        );
    };

    return (
        <div className="main-container vertical-flex">
            <Header />
            <div className="wordsearch-container vertical-flex">
                <div className="board">
                    {game.board.map((row, rowIndex) => (
                        <div key={rowIndex} className="row horizontal-flex">
                            {row.map((cell, colIndex) =>
                                renderCell(rowIndex, colIndex, cell)
                            )}
                        </div>
                    ))}
                </div>
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
                        <p>Palabra seleccionada: {selectedWord}</p>
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
