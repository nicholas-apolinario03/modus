import axios from 'axios';
import { garantirTokenValido } from './utils/refresh-ml.js';

export default async function handler(req, res) {
    const { titulo, usuarioId } = req.query;

    try {
        const accessToken = await garantirTokenValido(usuarioId);

        // API de predição do Mercado Livre
        const response = await axios.get(
            `https://api.mercadolibre.com/sites/MLB/category_predictor/predict?title=${encodeURIComponent(titulo)}`,
            { headers: { Authorization: `Bearer ${accessToken}` } }
        );

        // Retorna a categoria com maior probabilidade
        res.status(200).json(response.data);
    } catch (error) {
        res.status(500).json({ error: "Erro ao prever categoria" });
    }
}