import { useEffect, useState } from 'react';
import axios, { AxiosError } from 'axios';
import { useNavigate } from 'react-router-dom';
import { API_URL, formatError } from '../utils';
import Header from '../Header';
import './index.css';

interface UserScore {
  userId: string;
  gameName: string;
  metric: 'min' | 'counter';
  score: number;
}

interface GlobalScore {
  userId: string;
  userName: string;
  gameName: string;
  metric: 'min' | 'counter';
  score: number;
}

interface UserScores {
  [game: string]: UserScore;
}

function Scores() {
  const authorization = localStorage.getItem('authorization');
  const navigate = useNavigate();
  const [userScores, setUserScores] = useState<UserScores>({});
  const [globalScores, setGlobalScores] = useState<GlobalScore[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authorization) {
      navigate('/');
      return;
    }

    // Fetch user's best scores and global leaderboard
    const fetchScores = async () => {
      try {
        setLoading(true);

        // Fetch user's best scores
        const userResponse = await axios.get(`${API_URL}/metrics/user/all`, {
          headers: { Authorization: authorization }
        });

        // Convert array to object keyed by game name for easier access
        const userScoresObj: UserScores = {};
        userResponse.data.forEach((score: UserScore) => {
          userScoresObj[score.gameName] = score;
        });
        setUserScores(userScoresObj);

        // Fetch global best scores (leaderboard)
        const globalResponse = await axios.get(`${API_URL}/metrics/leaderboard`, {
          headers: { Authorization: authorization }
        });
        console.log(globalResponse.data);
        setGlobalScores(globalResponse.data);

      } catch (err) {
        formatError(err as AxiosError);
      } finally {
        setLoading(false);
      }
    };

    fetchScores();
  }, [authorization, navigate]);

  const formatGameName = (game: string) => {
    const gameNames: { [key: string]: string } = {
      'three-in-a-row': 'Tres en Línea',
      'memory': 'Memorama',
      'sudoku': 'Sudoku',
      'minesweeper': 'Buscaminas',
      'word-search': 'Sopa de Letras'
    };
    return gameNames[game] || game;
  };

  const formatScore = (score: number, metric: 'min' | 'counter') => {
    if (metric === 'min') {
      return score.toString();
    }
    return `${score} puntos`;
  };

  // Group global scores by game
  const groupScoresByGame = () => {
    const grouped: { [game: string]: GlobalScore[] } = {};
    globalScores.forEach(score => {
      if (!grouped[score.gameName]) {
        grouped[score.gameName] = [];
      }
      grouped[score.gameName].push(score);
    });
    return grouped;
  };

  const scoresByGame = groupScoresByGame();

  if (loading) {
    return (
      <div className="main-container vertical-flex">
        <Header />
        <div className="loading">Cargando puntuaciones...</div>
      </div>
    );
  }

  return (
    <div className="main-container vertical-flex">
      <Header />
      <button className="back-button" onClick={() => navigate('/games')}>←</button>

      <div className="scores-container">
        <h1>Puntuaciones</h1>

        {/* User's Best Scores Section */}
        <section className="scores-section">
          <h2>Tus Mejores Puntuaciones</h2>
          {Object.keys(userScores).length === 0 ? (
            <p className="no-scores">Aún no tienes puntuaciones. ¡Empieza a jugar!</p>
          ) : (
            <div className="scores-grid">
              {Object.entries(userScores).map(([game, score]) => (
                <div key={game} className="score-card user-score">
                  <h3>{formatGameName(game)}</h3>
                  <div className="score-value">{formatScore(score.score, score.metric)}</div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Global Leaderboard Section - Separate tables per game */}
        <section className="scores-section">
          <h2>Tablas de Clasificación por Juego</h2>
          {globalScores.length === 0 ? (
            <p className="no-scores">No hay puntuaciones globales aún.</p>
          ) : (
            <div className="leaderboards-by-game">
              {Object.entries(scoresByGame).map(([gameName, scores]) => (
                <div key={gameName} className="game-leaderboard">
                  <h3 className="game-title">{formatGameName(gameName)}</h3>
                  <table className="leaderboard-table">
                    <thead>
                      <tr>
                        <th>Posición</th>
                        <th>Jugador</th>
                        <th>Puntuación</th>
                      </tr>
                    </thead>
                    <tbody>
                      {scores.map((score, index) => (
                        <tr key={`${score.userId}-${index}`} className="leaderboard-row">
                          <td className="position">
                            {index === 0 && '🥇'}
                            {index === 1 && '🥈'}
                            {index === 2 && '🥉'}
                            {index > 2 && `#${index + 1}`}
                          </td>
                          <td className="player-name">{score.userName}</td>
                          <td className="score-value">{formatScore(score.score, score.metric)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default Scores;
