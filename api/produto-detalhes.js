import axios from 'axios';

export default async function handler(req, res) {
    const { id, usuarioId } = req.query;

    if (!id || !usuarioId) {
        return res.status(400).json({ error: "ID do produto e do usuário são obrigatórios" });
    }

    try {
        // 1. Busca o Token de acesso do usuário no seu banco de dados (Neon/PostgreSQL)
        const userToken = await buscarTokenNoBanco(usuarioId); 

        // 2. Busca os detalhes do produto no Mercado Livre
        const response = await axios.get(`https://api.mercadolibre.com/items/${id}`, {
            headers: {
                Authorization: `Bearer ${userToken.access_token}`
            }
        });

        // 3. Retorna os dados para o frontend preencher o formulário
        res.status(200).json(response.data);

    } catch (error) {
        console.error("Erro ao buscar detalhes do produto:", error.response?.data || error.message);
        res.status(500).json({ error: "Não foi possível carregar os detalhes do produto" });
    }
}