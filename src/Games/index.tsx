import { Link } from 'react-router-dom';
import './index.css';

const games = [
  { name: 'Tres en línea', url: 'three-in-a-row', img: '/three-in-a-row.jpg' },
  { name: 'Memorama', url: 'memory', img: '/memory.webp' },
  { name: 'Sudoku', url: 'sudoku', img: '/sudoku.webp' },
  { name: 'Buscaminas', url: 'minesweeper', img: '/minesweeper.webp' },
  { name: 'Sopa de letras', url: 'word-search', img: '/word-search.png' }
];

function Games() {
  return (
    <div className='vertical-flex'>
      <h1>Game Hub</h1>
      <div className='horizontal-flex games-container'>
        {games.map((game) => {
          return (
            <Link to={`${game.url}`} className='vertical-flex game-card'>
              <img src={game.img} alt={game.name} />
              <h2>{game.name}</h2>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export default Games;
