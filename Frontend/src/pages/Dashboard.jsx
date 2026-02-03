import { useEffect } from 'react';

export default function Dashboard() {
    const user = JSON.parse(localStorage.getItem('user'));
    const token = localStorage.getItem('token');
    useEffect(() => {
        if (!token || !user) {
            window.location.href = '/login';
        }
    }, [token, user])
    const handleLogout = () => {
        localStorage.clear();
        window.location.href = '/login';
    };
    return (
        <div >
        <h1>Bem-vindo, {user?.nome}!</h1>
        <button onClick={handleLogout}>Sair</button>
        </div>
    );
}