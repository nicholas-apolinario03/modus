import axios from 'axios';
import { garantirTokenValido } from './utils/refresh-ml.js';

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).send('Método não permitido');

    const { titulo, preco, quantidade, categoria, condicao, usuarioId } = req.body;

    try {
        const accessToken = await garantirTokenValido(usuarioId);

        // Dentro do seu handler, onde você monta o bodyML:
        const bodyML = {
            title: titulo,
            category_id: categoria,
            price: parseFloat(preco),
            currency_id: 'BRL',
            available_quantity: parseInt(quantidade),
            condition: condicao,
            listing_type_id: 'bronze',
            buying_mode: 'buy_it_now',
            // Adicionando a imagem enviada pelo formulário
            pictures: [
                { source: imagem }
            ]
        };

        const response = await axios.post('https://api.mercadolibre.com/items', bodyML, {
            headers: { Authorization: `Bearer ${accessToken}` }
        });

        res.status(201).json(response.data);
    } catch (error) {
        console.error("Erro ao postar no ML:", error.response?.data || error.message);
        res.status(500).json({ error: "Erro ao criar anúncio" });
    }
}