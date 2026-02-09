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
            const temTags = attr.tags && Array.isArray(attr.tags);

            // Filtro mais amplo: 
            // Captura o que é 'required' OU o que é 'catalog_required' 
            // OU atributos muito comuns em eletrônicos como 'BRAND' e 'MODEL'
            const ehEssencial = temTags && (
                attr.tags.includes('required') ||
                attr.tags.includes('catalog_required') ||
                ['BRAND', 'MODEL'].includes(attr.id)
            );

            // Continua ignorando campos que já temos no formulário fixo
            const ehCampoManual = ['condition', 'listing_type_id', 'buying_mode', 'price', 'quantity'].includes(attr.id);

            return ehEssencial && !ehCampoManual;
        });

        res.status(200).json(obrigatorios);
    } catch (error) {
        console.error("Erro ao buscar atributos:", error.message);
        res.status(500).json({ error: "Não foi possível carregar os requisitos da categoria." });
    }
}