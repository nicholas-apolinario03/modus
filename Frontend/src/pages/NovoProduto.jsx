import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function NovoProduto() {
    const user = JSON.parse(localStorage.getItem('user'));
    const navigate = useNavigate();
    const [mostrarOpcionais, setMostrarOpcionais] = useState(false);
    
    // Estados de Controle
    const [sugestao, setSugestao] = useState(null);
    const [carregandoCategoria, setCarregandoCategoria] = useState(false);
    const [urlImagem, setUrlImagem] = useState('');
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

    // --- LÓGICA DE BUSCA ---

    const buscarRequisitos = async (catId) => {
        if (!user?.id) return;
        try {
            const res = await fetch(`/api/categoria-detalhes?categoriaId=${catId}&usuarioId=${user.id}`);
            const data = await res.json();
            if (Array.isArray(data)) {
                setAtributosRequeridos(data);
                const iniciais = {};
                data.forEach(attr => iniciais[attr.id] = "");
                setValoresAtributos(iniciais);
            }
        } catch (err) {
            console.error("Erro ao carregar requisitos:", err.message);
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
        
        // Filtra atributos vazios para não sujar o envio
        const atributosFormatados = Object.keys(valoresAtributos)
            .filter(key => valoresAtributos[key] !== "")
            .map(key => ({
                id: key,
                value_name: valoresAtributos[key]
            }));

        try {
            const res = await fetch('/api/criar-produto', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...produto,
                    atributos: atributosFormatados,
                    usuarioId: user.id
                })
            });

            if (res.ok) {
                alert("Anúncio criado com sucesso!");
                navigate('/dashboard');
            } else {
                const erro = await res.json();
                alert("Erro ao criar: " + (erro.error || "Verifique os dados"));
            }
        } catch (err) {
            console.error("Erro ao criar:", err);
        }
    };

    // --- SUB-COMPONENTE INTERNO (Para acessar os estados) ---
    const RenderizarInput = ({ attr, obrigatorio }) => {
        const estilo = {
            width: '100%',
            padding: '10px',
            borderRadius: '4px',
            border: obrigatorio ? '1px solid #3483fa' : '1px solid #444',
            backgroundColor: 'white',
            color: 'black',
            marginTop: '5px'
        };

        if (attr.values && attr.values.length > 0) {
            return (
                <select 
                    required={obrigatorio}
                    style={estilo}
                    value={valoresAtributos[attr.id] || ""}
                    onChange={e => setValoresAtributos({...valoresAtributos, [attr.id]: e.target.value})}
                >
                    <option value="">{obrigatorio ? "Selecione..." : "Não informado"}</option>
                    {attr.values.map(v => <option key={v.id || v.name} value={v.name}>{v.name}</option>)}
                </select>
            );
        }

        return (
            <input 
                type="text"
                required={obrigatorio}
                placeholder={obrigatorio ? "Campo obrigatório" : "Ex: Branco, 110v..."}
                style={estilo}
                value={valoresAtributos[attr.id] || ""}
                onChange={e => setValoresAtributos({...valoresAtributos, [attr.id]: e.target.value})}
            />
        );
    };

    return (
        <div style={{ color: 'white', padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
            <h2>Anunciar Novo Produto</h2>
            
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {/* Título */}
                <div>
                    <label>Título do Produto</label>
                    <input
                        type="text"
                        required
                        onBlur={buscarSugestaoCategoria}
                        onChange={e => setProduto({ ...produto, titulo: e.target.value })}
                        style={{ width: '100%', padding: '10px', borderRadius: '4px', color: 'black' }}
                    />
                    {sugestao && <p style={{ color: '#00a650', fontSize: '12px' }}>✅ Categoria: {sugestao}</p>}
                </div>

                {/* Ficha Técnica Dinâmica */}
                {atributosRequeridos.length > 0 && (
                    <div style={{ backgroundColor: '#222', padding: '15px', borderRadius: '8px' }}>
                        <h4 style={{ marginBottom: '10px', color: '#3483fa' }}>Ficha Técnica</h4>
                        
                        {/* Obrigatórios */}
                        {atributosRequeridos.filter(a => a.ehObrigatorio).map(attr => (
                            <div key={attr.id} style={{ marginBottom: '15px' }}>
                                <label style={{ fontSize: '13px' }}>{attr.name} *</label>
                                <RenderizarInput attr={attr} obrigatorio={true} />
                            </div>
                        ))}

                        {/* Botão Opcionais */}
                        <button 
                            type="button"
                            onClick={() => setMostrarOpcionais(!mostrarOpcionais)}
                            style={{ background: 'none', color: '#3483fa', border: '1px solid #3483fa', padding: '5px 10px', cursor: 'pointer', borderRadius: '4px' }}
                        >
                            {mostrarOpcionais ? "▲ Ocultar opcionais" : "▼ Ver opcionais"}
                        </button>

                        {/* Opcionais */}
                        {mostrarOpcionais && (
                            <div style={{ marginTop: '15px', borderTop: '1px solid #444', paddingTop: '10px' }}>
                                {atributosRequeridos.filter(a => !a.ehObrigatorio).map(attr => (
                                    <div key={attr.id} style={{ marginBottom: '15px' }}>
                                        <label style={{ fontSize: '13px', color: '#ccc' }}>{attr.name}</label>
                                        <RenderizarInput attr={attr} obrigatorio={false} />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Campos de Preço e Qtd */}
                <div style={{ display: 'flex', gap: '10px' }}>
                    <input type="number" placeholder="Preço" required style={{ flex: 1, padding: '10px', color: 'black' }} onChange={e => setProduto({...produto, preco: e.target.value})} />
                    <input type="number" placeholder="Qtd" required style={{ flex: 1, padding: '10px', color: 'black' }} onChange={e => setProduto({...produto, quantidade: e.target.value})} />
                </div>

                {/* Imagem */}
                <input 
                    type="url" 
                    placeholder="URL da Imagem" 
                    required 
                    onChange={e => { setUrlImagem(e.target.value); setProduto({...produto, imagem: e.target.value}); }} 
                    style={{ padding: '10px', color: 'black' }} 
                />

                <button 
                    type="submit" 
                    disabled={carregandoCategoria}
                    style={{ padding: '15px', backgroundColor: '#3483fa', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                >
                    {carregandoCategoria ? "Aguarde..." : "Publicar Anúncio"}
                </button>
            </form>
        </div>
    );
}