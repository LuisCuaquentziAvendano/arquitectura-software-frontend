import { Route, Routes } from 'react-router-dom';
import Login from './Login';
import Games from './Games';
import ThreeInARow from './ThreeInARow';
import Memory from './Memory';
import Sudoku from './Sudoku';
import Minesweeper from './Minesweeper';
import Wordsearch from './Wordsearch';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/games" element={<Games />} />
      <Route path="/games/three-in-a-row" element={<ThreeInARow />} />
      <Route path="/games/memory" element={<Memory />} />
      <Route path="/games/sudoku" element={<Sudoku />} />
      <Route path="/games/minesweeper" element={<Minesweeper />} />
      <Route path="/games/wordsearch" element={<Wordsearch />} />
    </Routes>
  );
}

export default App;
