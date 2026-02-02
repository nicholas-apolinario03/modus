import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Register from './pages/Register';
// import Login from './pages/Login'; 

function App() {
  return (
    <Router>
      <Routes>
        {/* Quando o usuário acessar /register, mostra o componente Register */}
        <Route path="/register" element={<Register />} />
        
        {/* Rota inicial */}
        <Route path="/" element={<h1>Bem-vindo à Modus</h1>} />
      </Routes>
    </Router>
  );
}

export default App;