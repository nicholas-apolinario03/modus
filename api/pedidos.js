export default async function handler(req, res) {

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Origin', 'https://nicholas-apolinario03.github.io');


  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { order_id } = req.query;

  if (!order_id) {
    console.log("[API] Pedido não informado");
    return res.status(400).json({ error: "Parâmetro 'order_id' obrigatório." });
  }

  const access_token = process.env.MELI_ACCESS_TOKEN;

  if (!access_token) {
    console.log("[API] Access token não configurado");
    return res.status(500).json({ error: "Access token não configurado." });
  }

  const url = `https://api.mercadolibre.com/orders/${order_id}`;

  try {
    console.log(`[API] Buscando pedido ${order_id} com access token...`);
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${access_token}`,
        'x-version': '2'
      }
    });

    console.log(`[API] Status da resposta da API Mercado Livre: ${response.status}`);

    const data = await response.json();

    if (response.ok) {
      console.log(`[API] Pedido encontrado: ID ${data.id}`);
      return res.status(200).json(data);
    } else {
      console.log(`[API] Erro ao buscar pedido: ${JSON.stringify(data)}`);
      return res.status(response.status).json({
        error: "Erro ao buscar pedido.",
        message: data
      });
    }
  } catch (error) {
    console.log("[API] Erro interno:", error.message);
    return res.status(500).json({
      error: "Erro interno.",
      message: error.message
    });
  }
}
