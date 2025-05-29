// pages/api/pedidos/[order_id].js

export default async function handler(req, res) {
  // --- Configuração CORS (Pode manter o '*' para facilitar, mas o ideal é o domínio do GitHub Pages) ---
  res.setHeader('Access-Control-Allow-Origin', '*'); // Idealmente: 'https://nicholas-apolinario03.github.io'
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type,Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  // --- Fim da Configuração CORS ---

  const { order_id } = req.query; // Agora order_id virá do caminho da URL (ex: /api/pedidos/123)

  if (!order_id) {
    // Embora o Next.js já garanta que order_id existe para esta rota, é um bom fallback
    return res.status(400).json({ error: "Parâmetro 'order_id' obrigatório." });
  }

  const access_token = process.env.MELI_ACCESS_TOKEN;

  if (!access_token) {
    return res.status(500).json({ error: "Access token não configurado." });
  }

  const url = `https://api.mercadolibre.com/orders/${order_id}`;

  try {
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${access_token}`,
        'x-version': '2'
      }
    });

    const data = await response.json();

    if (response.ok) {
      return res.status(200).json(data);
    } else {
      return res.status(response.status).json({
        error: "Erro ao buscar detalhes do pedido no Mercado Livre.",
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
