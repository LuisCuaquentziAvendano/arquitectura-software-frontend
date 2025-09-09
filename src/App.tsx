import { Route, Routes } from 'react-router-dom';
import Login from './Login';
import Games from './Games';
import ThreeInARow from './ThreeInARow';
import Memory from './Memory';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/games" element={<Games />} />
      <Route path="/games/three-in-a-row" element={<ThreeInARow />} />
      <Route path="/games/memory" element={<Memory />} />
    </Routes>
  );
}

export default App;
