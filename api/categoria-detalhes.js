import axios from 'axios';

export default async function handler(req, res) {
    const { categoriaId } = req.query;

    if (!categoriaId) {
        return res.status(400).json({ error: "ID da categoria ausente" });
    }

    try {
        const response = await axios.get(`https://api.mercadolibre.com/categories/${categoriaId}/attributes`);

        // Adicionamos a verificação Array.isArray(attr.tags) para evitar o erro
        const obrigatorios = response.data.filter(attr => {
            // Verifica se existem tags e se é um array
            const temTags = attr.tags && Array.isArray(attr.tags);

            // Pega o que é 'required' OU 'fixed' (campos técnicos essenciais)
            const ehObrigatorio = temTags && (attr.tags.includes('required') || attr.tags.includes('fixed'));

            // Ignora campos que já temos fixos no formulário
            const ehCampoManual = ['condition', 'listing_type_id', 'buying_mode', 'price', 'quantity'].includes(attr.id);

            return ehObrigatorio && !ehCampoManual;
        });

        res.status(200).json(obrigatorios);
    } catch (error) {
        console.error("Erro ao buscar atributos:", error.message);
        res.status(500).json({ error: "Não foi possível carregar os requisitos da categoria." });
    }
}