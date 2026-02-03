import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function NovoProduto() {
    const user = JSON.parse(localStorage.getItem('user'));
    const navigate = useNavigate();
    const [sugestao, setSugestao] = useState(null);

    const [produto, setProduto] = useState({
        titulo: '',
        preco: '',
        quantidade: 1,
        categoria: 'MLB1234', // Sugiro deixar uma padrão por enquanto
        condicao: 'new'
    });


    const buscarSugestaoCategoria = async () => {
        if (produto.titulo.length < 5) return;

        try {
            const res = await fetch(`/api/sugerir-categoria?titulo=${produto.titulo}&usuarioId=${user.id}`);
            const data = await res.json();

            if (data.id) {
                setSugestao(data.name);
                setProduto({ ...produto, categoria: data.id });
            }
        } catch (err) {
            console.error("Erro ao buscar categoria");
        }
    };


    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch('/api/criar-produto', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...produto, usuarioId: user.id })
            });

            if (res.ok) {
                alert("Anúncio criado com sucesso!");
                navigate('/dashboard'); // Volta para o dashboard para ver o novo item
            }
        } catch (err) {
            console.error("Erro ao criar:", err);
        }
    };

    return (
        <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
            <h2>Anunciar Novo Produto</h2>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                    <label>Título do Produto</label>
                    <input
                        type="text"
                        placeholder="Ex: iPhone 13 Pro Max 128GB"
                        onBlur={buscarSugestaoCategoria} // Busca quando o usuário sai do campo
                        onChange={e => setProduto({ ...produto, titulo: e.target.value })}
                    />
                    {sugestao && (
                        <span style={{ fontSize: '12px', color: '#00a650' }}>
                            Categoria sugerida: <strong>{sugestao}</strong>
                        </span>
                    )}
                </div>
                
                <input
                    type="number" placeholder="Preço" required
                    onChange={e => setProduto({ ...produto, preco: e.target.value })}
                />
                <input
                    type="number" placeholder="Quantidade" required
                    onChange={e => setProduto({ ...produto, quantidade: e.target.value })}
                />
                <select onChange={e => setProduto({ ...produto, condicao: e.target.value })}>
                    <option value="new">Novo</option>
                    <option value="used">Usado</option>
                </select>

                <button type="submit" style={{ padding: '10px', background: '#3483fa', color: 'white', border: 'none', borderRadius: '4px' }}>
                    Publicar no Mercado Livre
                </button>
                <button type="button" onClick={() => navigate('/dashboard')}>Cancelar</button>
            </form>
        </div>
    );
}