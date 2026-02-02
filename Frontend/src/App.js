import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom ';
import Index from './pages/Index';
import Register from './pages/Register';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </Router>
  );
}

export default App;