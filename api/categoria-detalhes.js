import axios from 'axios';

export default async function handler(req, res) {
    const { categoriaId } = req.query;

    if (!categoriaId) {
        return res.status(400).json({ error: "ID da categoria ausente" });
    }

    try {
        const response = await axios.get(`https://api.mercadolibre.com/categories/${categoriaId}/attributes`);
        
        // Adicionamos a verificação Array.isArray(attr.tags) para evitar o erro
        const obrigatorios = response.data.filter(attr => 
            attr.tags && 
            Array.isArray(attr.tags) && 
            attr.tags.includes('required') && 
            !['condition', 'listing_type_id', 'buying_mode'].includes(attr.id)
        );

        res.status(200).json(obrigatorios);
    } catch (error) {
        console.error("Erro ao buscar atributos:", error.message);
        res.status(500).json({ error: "Não foi possível carregar os requisitos da categoria." });
    }
}