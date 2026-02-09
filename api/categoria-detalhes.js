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
        const obrigatorios = response.data.filter(attr => {
            const temTags = attr.tags && typeof attr.tags === 'object';

            // Novo Filtro: Pega o que é 'required' OU o que tem relevância 1 (máxima)
            // OU o que faz parte da hierarquia principal (PARENT_PK / CHILD_PK)
            const ehEssencial = (
                (temTags && attr.tags.required) ||
                attr.relevance === 1 ||
                ['PARENT_PK', 'CHILD_PK'].includes(attr.hierarchy)
            );

            const ehCampoManual = ['condition', 'listing_type_id', 'buying_mode'].includes(attr.id);

            return ehEssencial && !ehCampoManual;
        });

        res.status(200).json(obrigatorios);
    } catch (error) {
        console.error("Erro ao buscar atributos:", error.message);
        res.status(500).json({ error: "Não foi possível carregar os requisitos da categoria." });
    }
}