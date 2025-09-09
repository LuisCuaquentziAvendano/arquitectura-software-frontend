import './index.css';

const games = [
  { name: 'Tres en línea', img: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQLHhKjy5vV33SfjDzO9yCS91l_TgpeJrHlEg&s' },
  { name: 'Memorama', img: 'https://http2.mlstatic.com/D_NQ_NP_958392-MLM51245884476_082022-O.webp' },
  { name: 'Sudoku', img: 'https://play-lh.googleusercontent.com/DXTADSCjRBr0kOgfOt927vTqcxb5O4jcLQRUKVFTe5WblKMcB1spJ0W_A8VEf6v3Zb0=w240-h480-rw' },
  { name: 'Buscaminas', img: 'https://play-lh.googleusercontent.com/rMKdgtE7XpRvXKxBw8j-0nyBNFuhefcLVL36uz7RvTP_5_HIO8qPLJpaviuMeIjNkQ=w240-h480-rw' },
  { name: 'Sopa de letras', img: 'https://play-lh.googleusercontent.com/9H-MPEMhBzXQl745U4Ub7ilZ_JdsrHpfcOyyL7wsEp6bXTJ08wc4Ha9-zOULbJ85r7Z0' }
];

function Games() {
  return (
    <div className='vertical-flex'>
      <h1>Game Hub</h1>
      <div className='horizontal-flex games-container'>
        {games.map((game) => {
          return (
            <a href={`games/${game.name}`} className='vertical-flex game-card'>
              <img src={game.img} alt={game.name} />
              <h2>{game.name}</h2>
            </a>
          );
        })}
      </div>
    </div>
  );
}

export default Games;
