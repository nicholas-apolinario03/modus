import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Register from './pages/Register';
import Login from './pages/Login'; 
import Dashboard from './pages/Dashboard';
import Home from './pages/Home';

function App() {
  return (
    <Router>
      <Routes>
        {/* Quando o usuário acessar /register, mostra o componente Register */}
        <Route path="/register" element={<Register />} />
         <Route path="/login" element={<Login />} />
         <Route path="/dashboard" element={<Dashboard/>}/>
        {/* Rota inicial */}
        <Route path="/" element={<Home/>} />
      </Routes>
    </Router>
  );
}

export default App;