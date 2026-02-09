import axios from 'axios';
import { garantirTokenValido } from './utils/refresh-ml.js'; // Importe o seu validador

export default async function handler(req, res) {
    const { categoriaId, usuarioId } = req.query; // Receba o usuarioId também

    try {
        // Algumas categorias exigem autenticação para mostrar detalhes técnicos
        const accessToken = await garantirTokenValido(usuarioId);

        const response = await axios.get(`https://api.mercadolibre.com/categories/${categoriaId}/attributes`, {
            headers: { Authorization: `Bearer ${accessToken}` }
        });

        const obrigatorios = response.data.filter(attr =>
            attr.tags && attr.tags.includes('required') &&
            !['condition', 'listing_type_id', 'buying_mode'].includes(attr.id)
        );

        res.status(200).json(obrigatorios);
    } catch (error) {
        console.error("Erro no servidor:", error.response?.data || error.message);
        res.status(500).json({ error: "Falha ao buscar atributos" });
    }
}