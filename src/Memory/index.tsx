import axios, { AxiosError } from "axios";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { API_URL, formatError } from "../utils";
import "./index.css";

interface MemoryGame {
  shownCards: number[];
  moves: number;
  isEndOfGame: boolean;
  gameTime: string;
}

const UNKNOWN_CARD = -1;

function Memory() {
  const authorization = localStorage.getItem("authorization");
  const [game, setGame] = useState<MemoryGame>({
    gameTime: "",
    isEndOfGame: false,
    moves: 0,
    shownCards: [],
  });
  const [cardsBlocked, setCardsBlocked] = useState(false);

  useEffect(() => {
    if (!authorization)
      return;
    const initialize = async () => {
      try {
        const pairs = await getPairsNumber();
        if (!pairs)
          return;
        const res = await axios.post(
          `${API_URL}/memory/start-game`,
          { pairs: Number(pairs) },
          { headers: { authorization } },
        );
        setGame(res.data);
      } catch (error) {
        formatError(error as AxiosError);
      }
    };
    initialize();
  }, [authorization]);

  const getPairsNumber = async () => {
    return Swal.fire({
      text: "¿Con cuántos pares de cartas quieres jugar?",
      input: "number",
      showCancelButton: true,
      icon: "question",
      inputValidator: (value) => {
        if (!value || isNaN(Number(value)) || Number(value) <= 0)
          return "Debes ingresar un número positivo";
        return null;
      },
    }).then((result) => result.value);
  }

  const handleCardClick = (index: number) => {
    setCardsBlocked(true);
    axios
      .post(
        `${API_URL}/memory/play-turn`,
        { position: index },
        { headers: { authorization: authorization } }
      )
      .then((res) => {
        showHideCard(index, res.data.card);
      })
      .catch((res: AxiosError) => {
        formatError(res);
        setCardsBlocked(false);
      });
  };

  const showHideCard = (index: number, value: number) => {
    const updatedGame = JSON.parse(JSON.stringify(game));
    updatedGame.shownCards[index] = value;
    setGame(updatedGame);
    setTimeout(() => {
      axios
        .get(`${API_URL}/memory/game-status`, {
          headers: { authorization: authorization },
        })
        .then((res) => {
          setGame(res.data);
          setCardsBlocked(false);
        })
        .catch((res: AxiosError) => {
          formatError(res);
        });
    }, 2000);
  };

  return (
    <div className="main-container horizontal-flex">
      <div>
        <span>Movimientos: {game.moves}</span>
      </div>
      <div className="cards-container horizontal-flex">
        {game.shownCards.map((value, index) => {
          const isCovered = value == UNKNOWN_CARD;
          return (
            <button
              key={index}
              onClick={() => handleCardClick(index)}
              disabled={cardsBlocked || !isCovered}
              className={`${isCovered ? '' : 'highlight'} ${!cardsBlocked && isCovered ? 'active' : ''}`}
            >
              {isCovered ? "?" : value}
            </button>
          );
        })}
      </div>
      {game.isEndOfGame && (
        <div>🎉 ¡Fin del juego! Ganaste en {game.moves} movimientos</div>
      )}
    </div>
  );
}

export default Memory;
