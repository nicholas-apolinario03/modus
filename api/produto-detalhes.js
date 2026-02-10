import axios from 'axios';
import { garantirTokenValido } from '../utils/refresh-ml.js'; // Importação correta

export default async function handler(req, res) {
    const { id, usuarioId } = req.query;

    if (!id || !usuarioId) {
        return res.status(400).json({ error: "Dados incompletos" });
    }

    try {
        // 1. Usa a sua função que já cuida de tudo (Banco + Refresh)
        const accessToken = await garantirTokenValido(usuarioId);

        // 2. Busca o produto no Mercado Livre com o token validado
        const response = await axios.get(`https://api.mercadolibre.com/items/${id}`, {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        });

        // 3. Devolve os dados para o seu formulário no React
        res.status(200).json(response.data);

    } catch (error) {
        console.error("Erro na rota de detalhes:", error.message);
        res.status(500).json({ error: error.message || "Erro ao buscar dados" });
    }
}