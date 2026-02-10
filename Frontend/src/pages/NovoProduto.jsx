import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

export default function NovoProduto() {
    const { id } = useParams(); // Captura o ID da URL se estiver editando
    const user = JSON.parse(localStorage.getItem('user'));
    const navigate = useNavigate();
    
    const isEditing = !!id; // Booleano para controle de fluxo
    const [mostrarOpcionais, setMostrarOpcionais] = useState(false);

    // Estados de Controle e Interface
    const [sugestao, setSugestao] = useState(null);
    const [carregandoCategoria, setCarregandoCategoria] = useState(false);
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

    // 1. Efeito para carregar dados se for Edição
    useEffect(() => {
        if (isEditing && user?.id) {
            carregarDadosParaEdicao();
        }
    }, [id]);

    const carregarDadosParaEdicao = async () => {
        try {
            const res = await fetch(`/api/produto-detalhes?id=${id}&usuarioId=${user.id}`);
            const data = await res.json();

            if (data) {
                setProduto({
                    titulo: data.title,
                    preco: data.price,
                    quantidade: data.available_quantity,
                    categoria: data.category_id,
                    condicao: data.condition,
                    imagem: data.pictures?.[0]?.url || ''
                });

                const novosValores = {};
                data.attributes?.forEach(attr => {
                    novosValores[attr.id] = attr.value_name;
                });
                setValoresAtributos(novosValores);
                
                // Busca os campos da categoria para montar o formulário
                buscarRequisitos(data.category_id);
            }
        } catch (err) {
            console.error("Erro ao carregar dados para edição:", err);
        }
    };

    // 2. Lógica de Busca de Requisitos e Sugestão
    const buscarRequisitos = async (catId) => {
        if (!user?.id) return;
        try {
            const res = await fetch(`/api/categoria-detalhes?categoriaId=${catId}&usuarioId=${user.id}`);
            const data = await res.json();
            if (Array.isArray(data)) {
                setAtributosRequeridos(data);
                // Mantém os valores se já estiverem preenchidos (modo edição)
                setValoresAtributos(prev => {
                    const iniciais = { ...prev };
                    data.forEach(attr => {
                        if (!iniciais[attr.id]) iniciais[attr.id] = "";
                    });
                    return iniciais;
                });
            }
        } catch (err) {
            console.error("Erro ao carregar requisitos:", err.message);
        }
    };

    const buscarSugestaoCategoria = async () => {
        if (isEditing || produto.titulo.length < 5) return;
        setCarregandoCategoria(true);
        try {
            const res = await fetch(`/api/sugerir-categoria?titulo=${encodeURIComponent(produto.titulo)}&usuarioId=${user.id}`);
            const data = await res.json();
            if (data.id) {
                setSugestao(data.name);
                setProduto(prev => ({ ...prev, categoria: data.id }));
                buscarRequisitos(data.id);
            }
        } finally {
            setCarregandoCategoria(false);
        }
    };

    // 3. Envio do Formulário (POST ou PUT)
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const atributosFormatados = Object.keys(valoresAtributos)
            .filter(key => valoresAtributos[key] !== "")
            .map(key => ({ id: key, value_name: valoresAtributos[key] }));

        const metodo = isEditing ? 'PUT' : 'POST';
        const endpoint = isEditing ? `/api/atualizar-produto/${id}` : '/api/criar-produto';

        try {
            const res = await fetch(endpoint, {
                method: metodo,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...produto,
                    atributos: atributosFormatados,
                    usuarioId: user.id
                })
            });

            if (res.ok) {
                alert(isEditing ? "Anúncio atualizado!" : "Anúncio criado!");
                navigate('/dashboard');
            } else {
                const erro = await res.json();
                alert("Erro: " + (erro.error || "Verifique os dados"));
            }
        } catch (err) {
            console.error("Erro no envio:", err);
        }
    };

    const estiloInput = (obrigatorio) => ({
        width: '100%', padding: '10px', borderRadius: '4px', color: 'black', marginTop: '5px',
        border: obrigatorio ? '1px solid #3483fa' : '1px solid #444',
    });

    return (
        <div style={{ color: 'white', padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
            <h2>{isEditing ? "Editar Anúncio" : "Anunciar Novo Produto"}</h2>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <div>
                    <label>Título do Produto</label>
                    <input
                        type="text" required value={produto.titulo}
                        onBlur={buscarSugestaoCategoria}
                        onChange={e => setProduto({ ...produto, titulo: e.target.value })}
                        style={{ width: '100%', padding: '10px', borderRadius: '4px', color: 'black' }}
                    />
                    {sugestao && <p style={{ color: '#00a650', fontSize: '12px' }}>✅ Categoria: {sugestao}</p>}
                </div>

                {atributosRequeridos.length > 0 && (
                    <div style={{ backgroundColor: '#222', padding: '15px', borderRadius: '8px' }}>
                        <h4 style={{ marginBottom: '10px', color: '#3483fa' }}>Ficha Técnica</h4>
                        
                        {/* Campos Obrigatórios */}
                        {atributosRequeridos.filter(a => a.ehObrigatorio).map(attr => (
                            <div key={attr.id} style={{ marginBottom: '15px' }}>
                                <label style={{ fontSize: '13px' }}>{attr.name} *</label>
                                {attr.values?.length > 0 ? (
                                    <select required style={estiloInput(true)} value={valoresAtributos[attr.id] || ""} onChange={e => setValoresAtributos({ ...valoresAtributos, [attr.id]: e.target.value })}>
                                        <option value="">Selecione...</option>
                                        {attr.values.map(v => <option key={v.id || v.name} value={v.name}>{v.name}</option>)}
                                    </select>
                                ) : (
                                    <input type="text" required placeholder="Obrigatório" style={estiloInput(true)} value={valoresAtributos[attr.id] || ""} onChange={e => setValoresAtributos({ ...valoresAtributos, [attr.id]: e.target.value })} />
                                )}
                            </div>
                        ))}

                        <button type="button" onClick={() => setMostrarOpcionais(!mostrarOpcionais)} style={{ background: 'none', color: '#3483fa', border: '1px solid #3483fa', padding: '5px 10px', cursor: 'pointer', borderRadius: '4px' }}>
                            {mostrarOpcionais ? "▲ Ocultar opcionais" : "▼ Ver opcionais"}
                        </button>

                        {/* Opcionais */}
                        {mostrarOpcionais && (
                            <div style={{ marginTop: '15px', borderTop: '1px solid #444', paddingTop: '10px' }}>
                                {atributosRequeridos.filter(a => !a.ehObrigatorio).map(attr => (
                                    <div key={attr.id} style={{ marginBottom: '15px' }}>
                                        <label style={{ fontSize: '13px', color: '#ccc' }}>{attr.name}</label>
                                        {attr.values?.length > 0 ? (
                                            <select style={estiloInput(false)} value={valoresAtributos[attr.id] || ""} onChange={e => setValoresAtributos({ ...valoresAtributos, [attr.id]: e.target.value })}>
                                                <option value="">Não informado</option>
                                                {attr.values.map(v => <option key={v.id || v.name} value={v.name}>{v.name}</option>)}
                                            </select>
                                        ) : (
                                            <input type="text" placeholder="Opcional" style={estiloInput(false)} value={valoresAtributos[attr.id] || ""} onChange={e => setValoresAtributos({ ...valoresAtributos, [attr.id]: e.target.value })} />
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                <div style={{ display: 'flex', gap: '10px' }}>
                    <input type="number" placeholder="Preço" required value={produto.preco} style={{ flex: 1, padding: '10px', color: 'black' }} onChange={e => setProduto({ ...produto, preco: e.target.value })} />
                    <input type="number" placeholder="Qtd" required value={produto.quantidade} style={{ flex: 1, padding: '10px', color: 'black' }} onChange={e => setProduto({ ...produto, quantidade: e.target.value })} />
                </div>

                <input type="url" placeholder="URL da Imagem" required value={produto.imagem} style={{ padding: '10px', color: 'black' }} onChange={e => setProduto({ ...produto, imagem: e.target.value })} />

                <button type="submit" disabled={carregandoCategoria} style={{ padding: '15px', backgroundColor: '#3483fa', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                    {carregandoCategoria ? "Aguarde..." : isEditing ? "Atualizar Anúncio" : "Publicar Anúncio"}
                </button>
            </form>
        </div>
    );
}