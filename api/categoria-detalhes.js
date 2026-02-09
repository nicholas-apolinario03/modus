import axios from 'axios';

export default async function handler(req, res) {
    const { categoriaId } = req.query;

    if (!categoriaId) {
        return res.status(400).json({ error: "ID da categoria ausente" });
    }

    try {
        const response = await axios.get(`https://api.mercadolibre.com/categories/${categoriaId}/attributes`);

        // Adicionamos a verificação Array.isArray(attr.tags) para evitar o erro
        // No seu api/categoria-detalhes.js
        const atributosProcessados = response.data.map(attr => {
            const temTags = attr.tags && Array.isArray(attr.tags);

            return {
                id: attr.id,
                name: attr.name,
                values: attr.values,
                // Criamos uma flag simples para o frontend ler
                ehObrigatorio: temTags && (attr.tags.includes('required') || attr.tags.includes('fixed')),
                relevancia: attr.relevance
            };
        });

        res.status(200).json(atributosProcessados);
    } catch (error) {
        console.error("Erro ao buscar atributos:", error.message);
        res.status(500).json({ error: "Não foi possível carregar os requisitos da categoria." });
    }
}