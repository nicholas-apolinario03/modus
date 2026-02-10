export default async function handler(req, res) {
    const { id } = req.query; // ID do produto (ex: MLB123...)
    const { titulo, preco, quantidade, atributos, usuarioId } = req.body;

    try {
        const userToken = await buscarTokenNoBanco(usuarioId);

        // Estrutura para atualização no Mercado Livre
        const bodyML = {
            title: titulo,
            price: Number(preco),
            available_quantity: Number(quantidade),
            attributes: atributos // A ficha técnica que o Nicholas corrigiu
        };

        const response = await axios.put(`https://api.mercadolibre.com/items/${id}`, bodyML, {
            headers: {
                Authorization: `Bearer ${userToken.access_token}`,
                'Content-Type': 'application/json'
            }
        });

        res.status(200).json({ success: true, data: response.data });

    } catch (error) {
        console.error("Erro na atualização:", error.response?.data || error.message);
        res.status(400).json({ error: "Erro ao atualizar no Mercado Livre", detalhes: error.response?.data });
    }
}