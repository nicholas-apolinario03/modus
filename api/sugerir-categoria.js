import axios from 'axios';
import { garantirTokenValido } from './utils/refresh-ml.js';

export default async function handler(req, res) {
    const { titulo, usuarioId } = req.query;

    try {
        const accessToken = await garantirTokenValido(usuarioId);

        // A URL correta agora coloca o 'MLB' diretamente no caminho
        const response = await axios.get(
            `https://api.mercadolibre.com/sites/MLB/domain_discovery/search?q=${encodeURIComponent(titulo)}`,
            { headers: { Authorization: `Bearer ${accessToken}` } }
        );

        // O retorno dessa API é um array de sugestões
        if (response.data && response.data.length > 0) {
            // Pegamos o primeiro resultado, que contém 'category_id' e 'category_name'
            const sugestaoPrincipal = response.data[0];
            res.status(200).json({
                id: sugestaoPrincipal.category_id,
                name: sugestaoPrincipal.category_name
            });
        } else {
            res.status(404).json({ error: "Nenhuma categoria encontrada" });
        }
    } catch (error) {
        console.error("Erro na predição:", error.response?.data || error.message);
        res.status(500).json({ error: "Erro ao prever categoria" });
    }
}