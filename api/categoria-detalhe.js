import axios from 'axios';

export default async function handler(req, res) {
    const { categoriaId } = req.query;

    try {
        const response = await axios.get(`https://api.mercadolibre.com/categories/${categoriaId}/attributes`);
        
        // Filtramos apenas os atributos obrigatórios que não sejam 'condition' ou 'listing_type'
        // (pois esses já temos campos fixos no seu formulário)
        const obrigatorios = response.data.filter(attr => 
            attr.tags && 
            attr.tags.includes('required') && 
            !['condition', 'listing_type_id', 'buying_mode'].includes(attr.id)
        );

        res.status(200).json(obrigatorios);
    } catch (error) {
        res.status(500).json({ error: "Erro ao buscar atributos da categoria" });
    }
}