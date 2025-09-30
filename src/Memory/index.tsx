import axios from "axios";
import React, { useEffect, useState } from "react";
import { getApiUrl, statusOk } from "../utils";

export interface MemoryGameState {
  shownCards: number[];
  moves: number;
  isEndOfGame: boolean;
  gameTime: string;
}

export const UNKNOWN_CARD = -1;

async function Memory() {
  let createdGame = {} as MemoryGameState;

  try {
    console.log(getApiUrl());
    const pairs = 10;
    const authorization = localStorage.getItem('authorization');
    const res = await axios.post(
      `${getApiUrl()}/memory/start-game`,
      { pairs },
      { headers: { authorization } },
    );
    createdGame = res.data;
    if (!statusOk(res.status)) {
      alert('Something went wrong');
      return;
    }
  } catch (error) {
    console.error(error);
    return;
  }

  const [game, setGame] = useState<MemoryGameState>(createdGame);

  const postCardClick = (index: number) => {
    const updatedGame = { ...game };
    const card = 2;
    updatedGame.shownCards[index] = card;
    return updatedGame;
  };

  const handleCardClick = async (index: number) => {
    if (game.isEndOfGame) return;
    if (game.shownCards[index] !== UNKNOWN_CARD) return;
    try {
      const updatedGame = await postCardClick(index);
      setGame(updatedGame);
    } catch (err) {
      console.error("Error playing turn", err);
    }
  };

  const renderCard = (value: number, index: number) => {
    const isHidden = value === UNKNOWN_CARD;
    return (
      <button
        key={index}
        className={`w-16 h-16 flex items-center justify-center 
          border rounded-lg text-xl font-bold 
          ${isHidden ? "bg-gray-400" : "bg-blue-300"}
        `}
        onClick={() => handleCardClick(index)}
        disabled={game.isEndOfGame}
      >
        {isHidden ? "?" : value}
      </button>
    );
  };

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="flex justify-between w-full max-w-md text-lg font-semibold">
        <span>Moves: {game.moves}</span>
        <span>Time: {game.gameTime}</span>
      </div>

      <div
        className="grid gap-3"
        style={{
          gridTemplateColumns: `repeat(${Math.sqrt(game.shownCards.length)}, 1fr)`,
        }}
      >
        {game.shownCards.map((value, index) => renderCard(value, index))}
      </div>

      {game.isEndOfGame && (
        <div className="text-green-600 font-bold text-xl mt-4">
          🎉 Game Over! You won in {game.moves} moves.
        </div>
      )}
    </div>
  );
}

export default Memory;
