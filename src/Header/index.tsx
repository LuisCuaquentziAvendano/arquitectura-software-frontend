import './index.css';

function Header() {
    return <div>
        <a className="horizontal-flex" href="/games">
            <img src="/game-hub.webp" alt="game hub" />
            <h1>Game Hub</h1>
        </a>
    </div>;
}

export default Header;
