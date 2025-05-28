export default async function handler(req, res) {
  // --- Configuração CORS ---
  // Permite requisições do seu domínio do GitHub Pages
  res.setHeader('Access-Control-Allow-Origin', 'https://nicholas-apolinario03.github.io);
  // Permite os métodos HTTP que você pode usar (GET, POST, OPTIONS, etc.)
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  // Permite os cabeçalhos que o navegador pode enviar
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type,Authorization');

  // Lida com requisições OPTIONS (preflight requests) que os navegadores fazem para CORS
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  // --- Fim da Configuração CORS ---

  const { order_id } = req.query;

  if (!order_id) {
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
        error: "Erro ao buscar pedido.",
        message: data
      });
    }
  } catch (error) {
    return res.status(500).json({
      error: "Erro interno.",
      message: error.message
    });
  }
}
