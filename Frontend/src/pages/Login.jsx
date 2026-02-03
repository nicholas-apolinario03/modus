import { useState } from 'react';

export default function Login() {
    const [user, setUser] = useState({ email: '', senha: '' });


    const handleLogin = async (e) => {
        e.preventDefault();


        const response = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(user)
        });

        const data = await response.json();

        if (data.token) {
            // Salva no navegador (fica lá mesmo se atualizar a página)
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            // Redireciona para o Dashboard
            window.location.href = '/dashboard';

        }else{
            alert(data.error || "Erro ao realizar o Login")
        }
    }
    return (
        <div className="login-container">
            <h2>Criar Conta</h2>
            <form onSubmit={handleLogin}>
                <input
                    type="email"
                    placeholder="Email"
                    name="email"
                    onChange={(e) => setUser({ ...user, email: e.target.value })}
                />
                <input
                    type="password"
                    placeholder="Senha"
                    name="senha"
                    onChange={(e) => setUser({ ...user, senha: e.target.value })}
                />
                <button type="submit">Entrar</button>
            </form>
        </div>
    );
}
