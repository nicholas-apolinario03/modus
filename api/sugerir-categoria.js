import axios from 'axios';
import { garantirTokenValido } from './utils/refresh-ml.js';

export default async function handler(req, res) {
    const { titulo, usuarioId } = req.query;

    try {
        const accessToken = await garantirTokenValido(usuarioId);

        const response = await axios.get(
            `https://api.mercadolibre.com/sites/MLB/category_predictor/predict?title=${encodeURIComponent(titulo)}`,
            { headers: { Authorization: `Bearer ${accessToken}` } }
        );

        // O ML retorna um Array de sugestões. Vamos pegar a primeira (index 0)
        if (response.data && response.data.length > 0) {
            res.status(200).json(response.data[0]); 
        } else {
            res.status(404).json({ error: "Nenhuma categoria encontrada" });
        }
    } catch (error) {
        console.error("Erro na predição:", error.response?.data || error.message);
        res.status(500).json({ error: "Erro ao prever categoria" });
    }
}