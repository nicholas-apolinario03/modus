export default async function handler(req, res) {
  // --- Configuração CORS ---
  // Permite requisições do seu domínio do GitHub Pages
  res.setHeader('Access-Control-Allow-Origin', '*');
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

  const access_token = 'APP_USR-3704242181199025-052809-ef0f7bd5efacd9e0df113aa937612b1c-1357030258';

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
      // Se a resposta não for OK, ainda adiciona os cabeçalhos CORS antes de enviar o erro
      return res.status(response.status).json({
        error: "Erro ao buscar pedido.",
        message: data
      });
    }
  } catch (error) {
    // Se ocorrer um erro interno, ainda adiciona os cabeçalhos CORS antes de enviar o erro
    return res.status(500).json({
      error: "Erro interno.",
      message: error.message
    });
  }
}
