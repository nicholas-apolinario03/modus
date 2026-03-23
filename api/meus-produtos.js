import axios from 'axios';
import { garantirTokenValido } from './utils/refresh-ml.js';

export default async function handler(req, res) {
    const { usuarioId } = req.query; // Para o GET
    const { id, novoStatus, usuarioId: bodyUserId } = req.body; // Para o POST

    const userId = usuarioId || bodyUserId;

    if (!userId) return res.status(400).json({ error: "usuarioId é obrigatório" });

    try {
        const accessToken = await garantirTokenValido(userId);

        // --- LÓGICA DE LISTAGEM (GET) ---
        if (req.method === 'GET') {
            const searchRes = await axios.get(`https://api.mercadolibre.com/users/me/items/search`, {
                headers: { Authorization: `Bearer ${accessToken}` }
            });

            if (!searchRes.data.results.length) return res.status(200).json([]);

            const detailsRes = await axios.get(`https://api.mercadolibre.com/items?ids=${searchRes.data.results.join(',')}`, {
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

        // --- LÓGICA DE ALTERAR STATUS (POST/PUT) ---
        if (req.method === 'POST') {
            const statusParaML = novoStatus === 'deleted' ? 'closed' : novoStatus;

            // Passo 1: Mudar status (fechar ou pausar)
            await axios.put(`https://api.mercadolibre.com/items/${id}`, 
                { status: statusParaML },
                { headers: { Authorization: `Bearer ${accessToken}` } }
            );

            // Passo 2: Se for exclusão, deletar de fato
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
        res.status(500).json({ error: "Erro interno no servidor" });
    }
}