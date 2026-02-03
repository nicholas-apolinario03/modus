import axios from 'axios';
import { garantirTokenValido } from './utils/refresh-ml.js';

export default async function handler(req, res) {
    const { usuarioId } = req.query;

    try {
        // 1. Garante que o token está atualizado
        const accessToken = await garantirTokenValido(usuarioId);

        // 2. Busca os IDs dos anúncios do usuário
        // O ML retorna primeiro uma lista de IDs (ex: MLB12345)
        const buscaIds = await axios.get(`https://api.mercadolibre.com/users/me/items/search`, {
            headers: { Authorization: `Bearer ${accessToken}` }
        });

        const ids = buscaIds.data.results;

        if (!ids || ids.length === 0) {
            return res.status(200).json([]);
        }

        // 3. Busca os detalhes dos produtos (limitando aos 10 primeiros para teste)
        const idsString = ids.slice(0, 10).join(',');
        const detalhes = await axios.get(`https://api.mercadolibre.com/items?ids=${idsString}`, {
            headers: { Authorization: `Bearer ${accessToken}` }
        });

        // O ML retorna um array de objetos com { code: 200, body: { ... } }
        const produtosFormatados = detalhes.data.map(item => ({
            id: item.body.id,
            titulo: item.body.title,
            preco: item.body.price,
            imagem: item.body.thumbnail,
            link: item.body.permalink
        }));

        res.status(200).json(produtosFormatados);

    } catch (error) {
        console.error("Erro ao buscar produtos:", error.message);
        res.status(500).json({ error: "Erro ao carregar produtos do Mercado Livre" });
    }
}