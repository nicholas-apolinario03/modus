import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function NovoProduto() {
    const user = JSON.parse(localStorage.getItem('user'));
    const navigate = useNavigate();

    // Estados para Categoria e Imagem
    const [sugestao, setSugestao] = useState(null);
    const [carregandoCategoria, setCarregandoCategoria] = useState(false);
    const [urlImagem, setUrlImagem] = useState('');

    // --- NOVOS ESTADOS PARA O FORMULÁRIO DINÂMICO ---
    const [atributosRequeridos, setAtributosRequeridos] = useState([]);
    const [valoresAtributos, setValoresAtributos] = useState({});

    const [produto, setProduto] = useState({
        titulo: '',
        preco: '',
        quantidade: 1,
        categoria: '',
        condicao: 'new',
        imagem: ''
    });

    // Função que busca o que a categoria exige (Atributos)
    const buscarRequisitos = async (catId) => {
        try {
            const res = await fetch(`/api/categoria-detalhes?categoriaId=${catId}`);
            const data = await res.json();

            // AQUI ESTÁ O SEGREDO: Verifica se 'data' é um Array
            if (Array.isArray(data)) {
                setAtributosRequeridos(data);

                const iniciais = {};
                data.forEach(attr => iniciais[attr.id] = "");
                setValoresAtributos(iniciais);
            } else {
                // Se cair aqui, o backend enviou um erro em formato de objeto
                console.error("Erro vindo do backend:", data.error);
                setAtributosRequeridos([]);
            }
        } catch (err) {
            console.error("Erro ao carregar requisitos:", err.message);
            setAtributosRequeridos([]);
        }
    };

    const buscarSugestaoCategoria = async () => {
        if (produto.titulo.length < 5) return;

        setCarregandoCategoria(true);
        try {
            const res = await fetch(`/api/sugerir-categoria?titulo=${encodeURIComponent(produto.titulo)}&usuarioId=${user.id}`);
            const data = await res.json();

            if (data.id) {
                setSugestao(data.name);
                setProduto(prev => ({ ...prev, categoria: data.id }));
                // BUSCA OS CAMPOS OBRIGATÓRIOS ASSIM QUE ACHA A CATEGORIA
                buscarRequisitos(data.id);
            }
        } catch (err) {
            console.error("Erro ao buscar categoria");
        } finally {
            setCarregandoCategoria(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // FORMATANDO OS ATRIBUTOS PARA O PADRÃO DO MERCADO LIVRE
        const atributosFormatados = Object.keys(valoresAtributos).map(key => ({
            id: key,
            value_name: valoresAtributos[key]
        }));

        try {
            const res = await fetch('/api/criar-produto', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...produto,
                    atributos: atributosFormatados, // Envia os campos dinâmicos aqui
                    usuarioId: user.id
                })
            });

            if (res.ok) {
                alert("Anúncio criado com sucesso!");
                navigate('/dashboard');
            } else {
                const erro = await res.json();
                alert("Erro ao criar: " + (erro.error || "Verifique os dados técnicos"));
            }
        } catch (err) {
            console.error("Erro ao criar:", err);
        }
    };

    return (
        <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto', color: 'white' }}>
            <h2>Anunciar Novo Produto</h2>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                    <label>Título do Produto</label>
                    <input
                        type="text"
                        placeholder="Ex: iPhone 13 Pro Max 128GB"
                        required
                        onBlur={buscarSugestaoCategoria}
                        onChange={e => setProduto({ ...produto, titulo: e.target.value })}
                        style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc', color: 'black' }}
                    />

                    <div style={{ marginTop: '10px', padding: '10px', backgroundColor: '#202020', borderRadius: '4px', border: '1px solid #444' }}>
                        <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>
                            Categoria Selecionada:
                        </label>

                        {carregandoCategoria ? (
                            <span style={{ color: '#aaa' }}>Buscando melhor categoria...</span>
                        ) : sugestao ? (
                            <span style={{ color: '#00a650', fontWeight: '500' }}>
                                ✅ {sugestao}
                                <small style={{ color: '#888', marginLeft: '5px' }}>({produto.categoria})</small>
                            </span>
                        ) : (
                            <span style={{ color: '#888', fontStyle: 'italic' }}>
                                Digite o título e clique fora para sugerir...
                            </span>
                        )}
                    </div>
                </div>

                {/* --- RENDERIZAÇÃO DOS CAMPOS DINÂMICOS --- */}
                {atributosRequeridos.length > 0 && (
                    <div style={{ padding: '15px', backgroundColor: '#2a2a2a', borderRadius: '8px', border: '1px solid #3483fa' }}>
                        <h4 style={{ margin: '0 0 10px 0', color: '#3483fa' }}>Informações Obrigatórias:</h4>
                        {atributosRequeridos.map(attr => (
                            <div key={attr.id} style={{ marginBottom: '10px' }}>
                                <label style={{ display: 'block', fontSize: '13px', marginBottom: '4px' }}>{attr.name}</label>
                                <input
                                    type="text"
                                    placeholder={`Informe ${attr.name}`}
                                    required
                                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: 'none' }}
                                    onChange={e => setValoresAtributos({
                                        ...valoresAtributos,
                                        [attr.id]: e.target.value
                                    })}
                                />
                            </div>
                        ))}
                    </div>
                )}

                <input
                    type="number" placeholder="Preço (Ex: 1500)" required
                    onChange={e => setProduto({ ...produto, preco: e.target.value })}
                    style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc', color: 'black' }}
                />
                <input
                    type="number" placeholder="Quantidade em estoque" required
                    onChange={e => setProduto({ ...produto, quantidade: e.target.value })}
                    style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc', color: 'black' }}
                />

                <label>Condição</label>
                <select
                    onChange={e => setProduto({ ...produto, condicao: e.target.value })}
                    style={{ padding: '8px', borderRadius: '4px' }}
                >
                    <option value="new">Novo</option>
                    <option value="used">Usado</option>
                </select>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                    <label>URL da Imagem (Obrigatório)</label>
                    <input
                        type="url"
                        placeholder="https://link-da-foto.jpg"
                        required
                        onChange={e => {
                            setUrlImagem(e.target.value);
                            setProduto({ ...produto, imagem: e.target.value });
                        }}
                        style={{ padding: '8px', borderRadius: '4px', color: 'black' }}
                    />

                    {urlImagem && (
                        <div style={{ marginTop: '10px', textAlign: 'center' }}>
                            <p style={{ fontSize: '12px' }}>Prévia do anúncio:</p>
                            <img
                                src={urlImagem}
                                alt="Preview"
                                style={{ maxWidth: '150px', borderRadius: '8px', border: '2px solid #3483fa' }}
                                onError={() => console.log("Link de imagem inválido")}
                            />
                        </div>
                    )}
                </div>

                <button
                    type="submit"
                    disabled={!produto.categoria || carregandoCategoria}
                    style={{
                        padding: '12px',
                        background: !produto.categoria ? '#555' : '#3483fa',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: !produto.categoria ? 'not-allowed' : 'pointer',
                        fontWeight: 'bold'
                    }}
                >
                    {carregandoCategoria ? 'Processando...' : 'Publicar no Mercado Livre'}
                </button>

                <button type="button" onClick={() => navigate('/dashboard')} style={{ background: 'transparent', color: '#888', border: 'none', cursor: 'pointer' }}>
                    Cancelar
                </button>
            </form>
        </div>
    );
}