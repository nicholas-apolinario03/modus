import axios from 'axios';
import { garantirTokenValido } from './utils/refresh-ml.js';
import { db } from './bd.js'; 

export default async function handler(req, res) {
    // Pega o usuarioId de onde ele vier (Query no GET, Body no POST)
    const usuarioId = req.method === 'GET' ? req.query.usuarioId : req.body.usuarioId;

    if (!usuarioId) return res.status(400).json({ error: "usuarioId é obrigatório" });

    try {
        const accessToken = await garantirTokenValido(usuarioId);

        // --- LÓGICA DE LISTAGEM (GET) ---
        if (req.method === 'GET') {
            const result = await db.query('SELECT user_id_ml FROM tokens_ml WHERE usuario_id = $1', [usuarioId]);
            const userIdMl = result.rows[0]?.user_id_ml;

            if (!userIdMl) return res.status(400).json({ error: "ID do ML não encontrado." });

            const buscaIds = await axios.get(`https://api.mercadolibre.com/users/${userIdMl}/items/search`, {
                headers: { Authorization: `Bearer ${accessToken}` }
            });

            const ids = buscaIds.data.results;
            if (!ids || ids.length === 0) return res.status(200).json([]);

            const idsString = ids.slice(0, 20).join(',');
            const detalhes = await axios.get(`https://api.mercadolibre.com/items?ids=${idsString}`, {
                headers: { Authorization: `Bearer ${accessToken}` }
            });

            const produtosFormatados = detalhes.data.map(item => ({
                id: item.body.id,
                titulo: item.body.title,
                preco: item.body.price,
                status: item.body.status, 
                sub_status: item.body.sub_status,
                imagem: item.body.thumbnail,
                link: item.body.permalink
            }));

            return res.status(200).json(produtosFormatados);
        }

        // --- LÓGICA DE AÇÕES (POST) ---
        if (req.method === 'POST') {
            const { id, novoStatus } = req.body;
            
            // O status 'deleted' no ML exige que o item esteja 'closed' primeiro
            const statusParaML = novoStatus === 'deleted' ? 'closed' : novoStatus;

            // 1. Atualiza o status (Pausar ou Fechar para deletar)
            await axios.put(`https://api.mercadolibre.com/items/${id}`, 
                { status: statusParaML },
                { headers: { Authorization: `Bearer ${accessToken}` } }
            );

            // 2. Se a intenção era deletar, envia o comando final
            if (novoStatus === 'deleted') {
                await axios.put(`https://api.mercadolibre.com/items/${id}`, 
                    { deleted: 'true' },
                    { headers: { Authorization: `Bearer ${accessToken}` } }
                );
            }

            return res.status(200).json({ success: true });
        }

        return res.status(405).json({ error: "Método não permitido" });

    } catch (error) {
        console.error("Erro no ML:", error.response?.data || error.message);
        res.status(500).json({ error: "Erro na operação com Mercado Livre" });
    }
}