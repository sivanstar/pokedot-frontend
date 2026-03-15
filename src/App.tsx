import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

const HomePage = () => <div className="p-8"><h1 className="text-2xl">POKEDOT</h1></div>;

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
      </Routes>
    </Router>
  );
}

export default App;
