import { useEffect, useState } from 'react';
import axios from 'axios';

export default function Dashboard() {
    const user = JSON.parse(localStorage.getItem('user'));
    const token = localStorage.getItem('token');

    const [temVinculoML, setTemVinculoML] = useState(true); // Começa true para evitar o botão "piscar"
    const [carregandoML, setCarregandoML] = useState(true);

    useEffect(() => {
        // Segurança básica que você já tinha
        if (!token || !user) {
            window.location.href = '/login';
            return;
        }

        // 1. Captura o ?code= da URL se o usuário acabou de voltar do ML
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');

        if (code) {
            enviarCodeParaBackend(code);
        } else {
            verificarStatusML();
        }
    }, [token, user]);

    const verificarStatusML = async () => {
        if (!user?.id) return; // Se não tiver ID, nem tenta buscar

        try {
            const res = await fetch(`/api/status-ml?id=${user.id}`);
            const data = await res.json();
            setTemVinculoML(data.conectado);
        } catch (err) {
            setTemVinculoML(false);
        } finally {
            setCarregandoML(false);
        }
    };

    const enviarCodeParaBackend = async (code) => {
        try {
            const res = await fetch('/api/trocarcode', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code, usuarioId: user.id })
            });
            if (res.ok) {
                setTemVinculoML(true);
                // Limpa a URL para sumir o code
                window.history.replaceState({}, document.title, "/dashboard");
            }
        } catch (err) {
            console.error("Erro na troca:", err);
        } finally {
            setCarregandoML(false);
        }
    };

    const handleLogout = () => {
        localStorage.clear();
        window.location.href = '/login';
    };

    return (
        <div style={{ padding: '20px' }}>
            {/* Mantém o que já estava funcionando */}
            <h1>Bem-vindo, {user?.nome}!</h1>
            <p>Status da conta: {user?.email}</p>

            <hr />

            {/* Nova seção do Mercado Livre */}
            <div className="ml-section">
                {carregandoML ? (
                    <p>Verificando conexão com Mercado Livre...</p>
                ) : !temVinculoML ? (
                    <div style={{ background: '#fff3cd', padding: '15px', borderRadius: '8px' }}>
                        <p>Sua conta ainda não está vinculada ao Mercado Livre.</p>
                        <a
                            id="button_ml"
                            className="btn-ml"
                            href="https://auth.mercadolivre.com.br/authorization?response_type=code&client_id=3704242181199025&redirect_uri=https://modus-three.vercel.app/dashboard"
                        >
                            Vincular conta Mercado Livre
                        </a>
                    </div>
                ) : (
                    <p style={{ color: 'green' }}>✅ Sua conta está integrada ao Mercado Livre.</p>
                )}
            </div>

            <br />
            <button onClick={handleLogout}>Sair</button>
        </div>
    );
}