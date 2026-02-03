import { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from "react-router-dom";

export default function Dashboard() {
    const user = JSON.parse(localStorage.getItem('user'));
    const token = localStorage.getItem('token');

    const [temVinculoML, setTemVinculoML] = useState(true); // Começa true para evitar o botão "piscar"
    const [carregandoML, setCarregandoML] = useState(true);
    const [produtos, setProdutos] = useState([]);

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


    useEffect(() => {
        // Só busca produtos se estiver conectado ao ML e tiver o ID do usuário
        if (temVinculoML && user?.id) {
            carregarProdutos();
        }
    }, [temVinculoML, user?.id]);

    const carregarProdutos = async () => {
        try {
            const res = await fetch(`/api/meus-produtos?usuarioId=${user.id}`);
            const data = await res.json();

            // Verifica se o que chegou é realmente um array antes de salvar
            if (Array.isArray(data)) {
                setProdutos(data);
            } else {
                console.error("O backend não retornou um array:", data);
                setProdutos([]); // Força um array vazio para não quebrar o .map()
            }
        } catch (err) {
            console.error("Erro ao carregar lista de produtos:", err);
            setProdutos([]);
        }
    };


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
            <div className="lista-produtos" style={{ marginTop: '20px' }}>
                <h3>Seus Anúncios no Mercado Livre</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '15px' }}>
                    {produtos.map(prod => (
                        <div key={prod.id} style={{ border: '1px solid #ddd', padding: '10px', borderRadius: '8px', textAlign: 'center' }}>
                            <img src={prod.imagem} alt={prod.titulo} style={{ maxWidth: '100px' }} />
                            <h4 style={{ fontSize: '14px', margin: '10px 0' }}>{prod.titulo}</h4>
                            <p>R$ {prod.preco}</p>
                            <a href={prod.link} target="_blank" rel="noreferrer" style={{ fontSize: '12px', color: '#3483fa' }}>Ver no ML</a>
                        </div>
                    ))}
                    {produtos.length === 0 && <p>Nenhum produto encontrado.</p>}
                </div>
            </div>
            <br />
            <Link to='/novo-produto'></Link>
            <button onClick={handleLogout}>Sair</button>
        </div>
    );
}