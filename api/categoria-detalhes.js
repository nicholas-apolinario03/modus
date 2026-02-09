import axios from 'axios';

export default async function handler(req, res) {
    const { categoriaId } = req.query;

    try {
        // Tentamos buscar os atributos de forma pública (sem precisar do token)
        const response = await axios.get(`https://api.mercadolibre.com/categories/${categoriaId}/attributes`);
        
        const obrigatorios = response.data.filter(attr => 
            attr.tags && attr.tags.includes('required') && 
            !['condition', 'listing_type_id', 'buying_mode'].includes(attr.id)
        );

        res.status(200).json(obrigatorios);
    } catch (error) {
        console.error("Erro ao buscar atributos:", error.response?.data || error.message);
        res.status(500).json({ error: "Não foi possível carregar os requisitos da categoria." });
    }
}