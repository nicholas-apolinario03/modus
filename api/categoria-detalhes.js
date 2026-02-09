import axios from 'axios';

export default async function handler(req, res) {
    const { categoriaId } = req.query;

    if (!categoriaId) {
        return res.status(400).json({ error: "ID da categoria ausente" });
    }

    try {
        const response = await axios.get(`https://api.mercadolibre.com/categories/${categoriaId}/attributes`);

        // Adicionamos a verificação Array.isArray(attr.tags) para evitar o erro
        // No seu api/categoria-detalhes.js
        const obrigatorios = response.data.slice(0, 10);

        res.status(200).json(obrigatorios);
    } catch (error) {
        console.error("Erro ao buscar atributos:", error.message);
        res.status(500).json({ error: "Não foi possível carregar os requisitos da categoria." });
    }
}