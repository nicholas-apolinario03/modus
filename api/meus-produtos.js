import axios from 'axios';
import { garantirTokenValido } from './utils/refresh-ml.js';
import { db } from './bd.js'; // Importe o banco aqui

export default async function handler(req, res) {
    const { usuarioId } = req.query;

    try {
        const accessToken = await garantirTokenValido(usuarioId);

        // 1. Buscar o ID do Mercado Livre (user_id_ml) que salvamos na tabela
        const result = await db.query('SELECT user_id_ml FROM tokens_ml WHERE usuario_id = $1', [usuarioId]);
        const userIdMl = result.rows[0]?.user_id_ml;

        if (!userIdMl) {
            return res.status(400).json({ error: "ID do Mercado Livre não encontrado no banco." });
        }

        // 2. Usar o ID numérico diretamente na URL em vez de "me"
        const buscaIds = await axios.get(`https://api.mercadolibre.com/users/${userIdMl}/items/search`, {
            headers: { Authorization: `Bearer ${accessToken}` }
        });

        const ids = buscaIds.data.results;

        if (!ids || ids.length === 0) {
            return res.status(200).json([]); // Retorna vazio se não houver anúncios
        }

        // Pegue no máximo 10 para testar e garanta que virou uma string limpa
        const idsString = ids.slice(0, 10).join(',');
        const detalhes = await axios.get(`https://api.mercadolibre.com/items?ids=${idsString}`, {
            headers: { Authorization: `Bearer ${accessToken}` }
        });

        // O ML retorna um array de objetos com { code: 200, body: { ... } }
        const produtosFormatados = detalhes.data.map(item => ({
            id: item.body.id,
            titulo: item.body.title,
            preco: item.body.price,
            status: item.body.status, 
            sub_status: item.body.sub_status,
            imagem: item.body.thumbnail,
            link: item.body.permalink
        }));

        res.status(200).json(produtosFormatados);

    } catch (error) {
        // Isso vai mostrar o motivo real no log da Vercel (ex: "invalid_token")
        console.error("Detalhes do erro no ML:", error.response?.data);
        res.status(500).json({ error: "Erro ao carregar produtos" });
    }
}