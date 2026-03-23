import axios from 'axios';
import { garantirTokenValido } from '../utils/refresh-ml.js';

export default async function handler(req, res) {
    // Pega o usuarioId dependendo do tipo de requisição
    const usuarioId = req.method === 'GET' ? req.query.usuarioId : req.body.usuarioId;

    if (!usuarioId) {
        return res.status(400).json({ error: "usuarioId é obrigatório" });
    }

    try {
        const accessToken = await garantirTokenValido(usuarioId);

        // --- LÓGICA PARA LISTAR (GET) ---
        if (req.method === 'GET') {
            // Busca o seller_id do usuário logado
            const userRes = await axios.get(`https://api.mercadolibre.com/users/me`, {
                headers: { Authorization: `Bearer ${accessToken}` }
            });
            const sellerId = userRes.data.id;

            // Busca os IDs dos anúncios
            const searchRes = await axios.get(`https://api.mercadolibre.com/users/${sellerId}/items/search`, {
                headers: { Authorization: `Bearer ${accessToken}` }
            });

            const ids = searchRes.data.results;
            if (!ids || ids.length === 0) return res.status(200).json([]);

            // Busca os detalhes (limite de 20 por vez na API do ML)
            const detailsRes = await axios.get(`https://api.mercadolibre.com/items?ids=${ids.slice(0, 20).join(',')}`, {
                headers: { Authorization: `Bearer ${accessToken}` }
            });

            const produtos = detailsRes.data.map(item => ({
                id: item.body.id,
                titulo: item.body.title,
                preco: item.body.price,
                status: item.body.status,
                sub_status: item.body.sub_status,
                imagem: item.body.thumbnail,
                link: item.body.permalink
            }));

            return res.status(200).json(produtos);
        }

        // --- LÓGICA PARA STATUS (POST) ---
        if (req.method === 'POST') {
            const { id, novoStatus } = req.body;
            
            if (!id || !novoStatus) {
                return res.status(400).json({ error: "ID e novoStatus são necessários" });
            }

            const statusParaML = novoStatus === 'deleted' ? 'closed' : novoStatus;

            // Atualiza status básico
            await axios.put(`https://api.mercadolibre.com/items/${id}`, 
                { status: statusParaML },
                { headers: { Authorization: `Bearer ${accessToken}` } }
            );

            // Se for exclusão, envia a flag de deletado
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
        console.error("Erro na API de produtos:", error.response?.data || error.message);
        // Retorna o erro detalhado para ajudar no seu TCC
        return res.status(500).json({ 
            error: "Falha na comunicação com Mercado Livre",
            detalhes: error.response?.data || error.message 
        });
    }
}