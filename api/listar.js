// pages/api/pedidos/listar.js

export default async function handler(req, res) {
  // --- Configuração CORS (Pode manter o '*' para facilitar, mas o ideal é o domínio do GitHub Pages) ---
  res.setHeader('Access-Control-Allow-Origin', '*'); // Idealmente: 'https://nicholas-apolinario03.github.io'
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type,Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  // --- Fim da Configuração CORS ---

  const { seller_id, status, limit, offset } = req.query; // Pega o seller_id e outros filtros

  if (!seller_id) {
    return res.status(400).json({ error: "Parâmetro 'seller_id' obrigatório." });
  }

  const access_token = process.env.MELI_ACCESS_TOKEN;

  if (!access_token) {
    return res.status(500).json({ error: "Access token não configurado." });
  }

  let queryParams = `seller=${seller_id}`;
  if (status) queryParams += `&order.status=${status}`;
  if (limit) queryParams += `&limit=${limit}`;
  if (offset) queryParams += `&offset=${offset}`;

  const url = `https://api.mercadolibre.com/orders/search?${queryParams}`;

  try {
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${access_token}`,
        'x-version': '2'
      }
    });

    const data = await response.json();

    if (response.ok) {
      return res.status(200).json(data); // Retorna a lista de pedidos
    } else {
      return res.status(response.status).json({
        error: "Erro ao buscar lista de pedidos no Mercado Livre.",
        message: data
      });
    }
  } catch (error) {
    return res.status(500).json({
      error: "Erro interno da API (Vercel).",
      message: error.message
    });
  }
}
