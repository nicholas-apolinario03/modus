import { useEffect, useState } from 'react';
import { Link, useNavigate } from "react-router-dom";
import './Dashboard.css';

export default function Dashboard() {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user'));
    const token = localStorage.getItem('token');

    const [temVinculoML, setTemVinculoML] = useState(true);
    const [carregandoML, setCarregandoML] = useState(true);
    const [produtos, setProdutos] = useState([]);

    // --- FUNÇÕES DE APOIO ---
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

    const alterarStatus = async (produtoId, novoStatus) => {
        if (novoStatus === 'deleted' && !window.confirm("Deseja excluir permanentemente?")) return;

        try {
            const res = await fetch(`/api/meus-produtos`, { 
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: produtoId,
                    novoStatus: novoStatus,
                    usuarioId: user.id
                })
            });

            if (res.ok) {
                carregarProdutos(); 
            }
        } catch (err) {
            console.error("Erro ao atualizar status:", err);
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

    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
    };

    return (
       <div className="dashboard-container">
            <div className="dashboard-header">
                <h1>Olá, {user?.nome}!</h1>
                <button onClick={handleLogout} className="btn-logout">Sair</button>
            </div>

            <hr className="divider" />

            <div className="ml-connection-status">
                {carregandoML ? (
                    <p>Verificando conexão...</p>
                ) : !temVinculoML ? (
                    <div className="alert-not-linked">
                        <p style={{ color: '#ffd666', marginBottom: '10px' }}>⚠️ Conta não vinculada ao Mercado Livre.</p>
                        <a href="https://auth.mercadolivre.com.br/authorization?..." className="btn-link-ml">
                            Vincular Agora
                        </a>
                    </div>
                ) : (
                    <p style={{ color: '#00a650' }}>✅ Conta integrada ao Mercado Livre.</p>
                )}
            </div>

            <div className="lista-produtos">
                <div className="products-section-header">
                    <h3>Seus Anúncios</h3>
                    <Link to='/novo-produto' className="btn-new-product">+ Novo Anúncio</Link>
                </div>

                <div className="products-grid">
                    {produtos.map(prod => {
                        const statusInfo = traduzirStatus(prod.status);
                        return (
                            <div key={prod.id} className="product-card">
                                <div className="product-info-top">
                                    <img src={prod.imagem} alt={prod.titulo} className="product-image" />
                                    <h4 className="product-title">{prod.titulo}</h4>
                                    <p className="product-price">R$ {prod.preco}</p>

                                    <div className="status-badge-container">
                                        <span 
                                            className="status-badge"
                                            style={{ backgroundColor: statusInfo.bg, color: statusInfo.color }}
                                        >
                                            {statusInfo.label}
                                        </span>
                                        {prod.sub_status && prod.sub_status.length > 0 && (
                                            <p className="sub-status-text">
                                                {traduzirSubStatus(prod.sub_status[0])}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div className="product-actions">
                                    <a href={prod.link} target="_blank" rel="noreferrer" className="link-ml-external">Ver no ML</a>
                                    <div className="button-group">
                                        <button onClick={() => navigate(`/editar-produto/${prod.id}`)} className="btn-edit">Editar</button>
                                        
                                        <button
                                            onClick={() => alterarStatus(prod.id, prod.status === 'active' ? 'paused' : 'active')}
                                            className="btn-toggle-status"
                                            style={{ backgroundColor: prod.status === 'active' ? '#ffad5c' : '#00a650', color: 'white' }}
                                        >
                                            {prod.status === 'active' ? 'Pausar' : 'Reativar'}
                                        </button>

                                        <button onClick={() => alterarStatus(prod.id, 'deleted')} className="btn-delete">
                                            Excluir
                                        </button>
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