import { useEffect, useState } from 'react';
import { Link, useNavigate } from "react-router-dom";

export default function Dashboard() {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user'));
    const token = localStorage.getItem('token');

    const [temVinculoML, setTemVinculoML] = useState(true);
    const [carregandoML, setCarregandoML] = useState(true);
    const [produtos, setProdutos] = useState([]);

    // --- FUNÇÕES DE TRADUÇÃO E ESTILO ---
    const traduzirStatus = (status) => {
        const tipos = {
            'active': { label: 'Ativo', color: '#00a650', bg: '#e6f6ef' },
            'paused': { label: 'Pausado', color: '#ffad00', bg: '#fff7e6' },
            'under_review': { label: 'Em Revisão', color: '#3483fa', bg: '#eaf2ff' },
            'closed': { label: 'Finalizado', color: '#8c8c8c', bg: '#f5f5f5' }
        };
        return tipos[status] || { label: status, color: '#555', bg: '#eee' };
    };

    const traduzirSubStatus = (sub) => {
        const erros = {
            'waiting_for_patch': 'Faltam dados técnicos obrigatórios.',
            'held_by_ops': 'Bloqueado para revisão de segurança.',
            'picture_error': 'Erro nas imagens do produto.',
            'out_of_stock': 'Sem estoque disponível.'
        };
        return erros[sub] || `Atenção: ${sub}`;
    };

    // --- LÓGICA DE DADOS ---
    useEffect(() => {
        if (!token || !user) {
            navigate('/login');
            return;
        }
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');

        if (code) {
            enviarCodeParaBackend(code);
        } else {
            verificarStatusML();
        }
    }, []);

    useEffect(() => {
        if (temVinculoML && user?.id) {
            carregarProdutos();
        }
    }, [temVinculoML]);

    const carregarProdutos = async () => {
        try {
            const res = await fetch(`/api/meus-produtos?usuarioId=${user.id}`);
            const data = await res.json();
            setProdutos(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error("Erro ao carregar produtos:", err);
            setProdutos([]);
        }
    };

    const verificarStatusML = async () => {
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
                window.history.replaceState({}, document.title, "/dashboard");
            }
        } finally {
            setCarregandoML(false);
        }
    };

    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
    };

    return (
        <div style={{ padding: '20px', color: 'white', backgroundColor: '#121212', minHeight: '100vh' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h1>Olá, {user?.nome}!</h1>
                <button onClick={handleLogout} style={{ background: '#f5222d', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '4px', cursor: 'pointer' }}>Sair</button>
            </div>
            
            <hr style={{ border: '0.5px solid #333', margin: '20px 0' }} />

            {/* Status da Conexão ML */}
            <div style={{ marginBottom: '30px' }}>
                {carregandoML ? (
                    <p>Verificando conexão...</p>
                ) : !temVinculoML ? (
                    <div style={{ background: '#332b00', padding: '15px', borderRadius: '8px', border: '1px solid #ffd666' }}>
                        <p style={{ color: '#ffd666', marginBottom: '10px' }}>⚠️ Conta não vinculada ao Mercado Livre.</p>
                        <a href="https://auth.mercadolivre.com.br/authorization?response_type=code&client_id=3704242181199025&redirect_uri=https://modus-three.vercel.app/dashboard" 
                           style={{ background: '#3483fa', color: 'white', padding: '10px 20px', borderRadius: '4px', textDecoration: 'none', fontWeight: 'bold', display: 'inline-block' }}>
                            Vincular Agora
                        </a>
                    </div>
                ) : (
                    <p style={{ color: '#00a650' }}>✅ Conta integrada ao Mercado Livre.</p>
                )}
            </div>

            {/* Listagem de Anúncios */}
            <div className="lista-produtos">
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                    <h3>Seus Anúncios</h3>
                    <Link to='/novo-produto' style={{ background: '#3483fa', color: 'white', padding: '10px 20px', borderRadius: '4px', textDecoration: 'none', fontWeight: 'bold' }}>+ Novo Anúncio</Link>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '20px' }}>
                    {produtos.map(prod => {
                        const statusInfo = traduzirStatus(prod.status);
                        return (
                            <div key={prod.id} style={{ backgroundColor: '#1e1e1e', padding: '15px', borderRadius: '12px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', border: '1px solid #333' }}>
                                <div style={{ textAlign: 'center' }}>
                                    <img src={prod.imagem} alt={prod.titulo} style={{ width: '120px', height: '120px', objectFit: 'contain', marginBottom: '10px', borderRadius: '4px' }} />
                                    <h4 style={{ fontSize: '14px', marginBottom: '8px', height: '40px', overflow: 'hidden' }}>{prod.titulo}</h4>
                                    <p style={{ fontWeight: 'bold', fontSize: '18px', color: '#fff' }}>R$ {prod.preco}</p>
                                    
                                    {/* Tag de Status */}
                                    <div style={{ margin: '10px 0' }}>
                                        <span style={{ backgroundColor: statusInfo.bg, color: statusInfo.color, padding: '3px 10px', borderRadius: '10px', fontSize: '11px', fontWeight: 'bold' }}>
                                            {statusInfo.label}
                                        </span>
                                        {prod.sub_status && prod.sub_status.length > 0 && (
                                            <p style={{ color: '#ff4d4d', fontSize: '10px', marginTop: '5px' }}>
                                                {traduzirSubStatus(prod.sub_status[0])}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '15px' }}>
                                    <a href={prod.link} target="_blank" rel="noreferrer" style={{ textAlign: 'center', fontSize: '12px', color: '#3483fa', textDecoration: 'none' }}>Ver no ML</a>
                                    <div style={{ display: 'flex', gap: '5px' }}>
                                        <button onClick={() => navigate(`/editar-produto/${prod.id}`)} style={{ flex: 1, padding: '6px', cursor: 'pointer', background: '#444', color: 'white', border: 'none', borderRadius: '4px' }}>Editar</button>
                                        <button style={{ flex: 1, padding: '6px', cursor: 'pointer', background: '#331111', color: '#ff4d4f', border: '1px solid #331111', borderRadius: '4px' }}>Excluir</button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
                {produtos.length === 0 && !carregandoML && <p style={{ color: '#666' }}>Nenhum anúncio encontrado.</p>}
            </div>
        </div>
    );
}