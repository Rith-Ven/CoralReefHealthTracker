import { Routes, Route } from 'react-router-dom';
import ReefList from './ReefList';
import './App.css';

function App() {
  return (
    <Routes>
      <Route path="/" element={<ReefList />} />
    </Routes>
  );
}

export default App;
