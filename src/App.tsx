import { Route, Routes } from 'react-router-dom';
import Login from './Login';
import Games from './Games';
import ThreeInARow from './ThreeInARow';
import Memory from './Memory';
import Sudoku from './Sudoku';
import Scores from './Scores';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/games" element={<Games />} />
      <Route path="/games/three-in-a-row" element={<ThreeInARow />} />
      <Route path="/games/memory" element={<Memory />} />
      <Route path="/games/sudoku" element={<Sudoku />} />
      <Route path="/scores" element={<Scores />} />
    </Routes>
  );
}

export default App;
