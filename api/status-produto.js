import axios from 'axios';
import { garantirTokenValido } from '../utils/refresh-ml.js';

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Método não permitido' });

    const { id, novoStatus, usuarioId } = req.body;

    try {
        const accessToken = await garantirTokenValido(usuarioId);

        // No ML, para excluir (deleted), o item DEVE estar como 'closed' primeiro.
        // Se o comando for 'deleted', fazemos dois passos ou garantimos que feche.
        const statusParaML = novoStatus === 'deleted' ? 'closed' : novoStatus;

        const response = await axios.put(`https://api.mercadolibre.com/items/${id}`, 
            { status: statusParaML },
            { headers: { Authorization: `Bearer ${accessToken}` } }
        );

        // Se o objetivo final era deletar, enviamos o segundo comando
        if (novoStatus === 'deleted') {
            await axios.put(`https://api.mercadolibre.com/items/${id}`, 
                { deleted: 'true' },
                { headers: { Authorization: `Bearer ${accessToken}` } }
            );
        }

        res.status(200).json({ success: true, message: `Status alterado para ${novoStatus}` });
    } catch (error) {
        console.error("Erro ao alterar status:", error.response?.data || error.message);
        res.status(500).json({ error: "Erro ao processar alteração no Mercado Livre" });
    }
}