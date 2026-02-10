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
      const atributosProcessados = response.data.map(attr => {
    const temTags = attr.tags && typeof attr.tags === 'object';
    
    // Regra: PARENT_PK e CHILD_PK são os únicos obrigatórios por padrão
    // Mantemos as tags explícitas 'required' e 'fixed' por segurança
    const ehObrigatorio = (
        ['PARENT_PK', 'CHILD_PK'].includes(attr.hierarchy) ||
        (temTags && (attr.tags.required || attr.tags.fixed || attr.tags.conditional_required))
    );

    return {
        id: attr.id,
        name: attr.name,
        values: attr.values,
        hierarchy: attr.hierarchy, // Útil para debug no console
        ehObrigatorio: ehObrigatorio
    };
});

res.status(200).json(atributosProcessados);
    } catch (error) {
        console.error("Erro ao buscar atributos:", error.message);
        res.status(500).json({ error: "Não foi possível carregar os requisitos da categoria." });
    }
}