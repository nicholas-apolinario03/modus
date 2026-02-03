import { useState } from 'react';

export default function Register() {
  const [user, setUser] = useState({ nome: '', email: '', senha: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Conecta com o seu backend
    const response = await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(user)
    });

    const data = await response.json();
    alert(data.message || data.error);
  };

  return (
    <div className="register-container">
      <h2>Criar Conta</h2>
      <form onSubmit={handleSubmit}>
        <input 
          type="text" 
          placeholder="Nome" 
          onChange={(e) => setUser({...user, nome: e.target.value})} 
        />
        <input 
          type="email" 
          placeholder="Email" 
          onChange={(e) => setUser({...user, email: e.target.value})} 
        />
        <input 
          type="password" 
          placeholder="Senha" 
          onChange={(e) => setUser({...user, senha: e.target.value})} 
        />
        <button type="submit">Cadastrar</button>
      </form>
    </div>
  );
}