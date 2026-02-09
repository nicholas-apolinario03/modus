import axios from 'axios';
import { garantirTokenValido } from './utils/refresh-ml.js';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Método não permitido' });
    }

    // Recebendo os dados do formulário, incluindo o novo array de atributos
    const { 
        titulo, 
        preco, 
        quantidade, 
        categoria, 
        condicao, 
        usuarioId, 
        imagem, 
        atributos 
    } = req.body;

    try {
        // 1. Garante que o Nicholas está com um token de acesso válido (Auto-refresh)
        const accessToken = await garantirTokenValido(usuarioId);

        // 2. Monta o corpo do anúncio seguindo rigorosamente o padrão do Mercado Livre
        const bodyML = {
            title: titulo,
            category_id: categoria,
            price: parseFloat(preco),
            currency_id: 'BRL',
            available_quantity: parseInt(quantidade),
            condition: condicao,
            listing_type_id: 'bronze', // Tipo de anúncio (Clássico)
            buying_mode: 'buy_it_now',
            pictures: [
                { source: imagem }
            ],
            // Aqui injetamos os atributos que o seu formulário dinâmico capturou
            attributes: atributos || []
        };

        // 3. Envia para a API do Mercado Livre
        const response = await axios.post('https://api.mercadolibre.com/items', bodyML, {
            headers: { 
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        });

        // 4. Se chegou aqui, o anúncio está no ar!
        res.status(201).json({
            message: "Anúncio criado com sucesso!",
            ml_id: response.data.id,
            link: response.data.permalink
        });

    } catch (error) {
        // Log detalhado para você ver no console da Vercel o que o ML reclamou desta vez
        console.error("Erro detalhado do ML:", JSON.stringify(error.response?.data || error.message, null, 2));
        
        const mensagemErro = error.response?.data?.message || "Erro interno ao criar anúncio";
        res.status(error.response?.status || 500).json({ error: mensagemErro });
    }
}