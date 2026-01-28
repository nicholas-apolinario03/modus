import axios from "axios";

function setCors(res) {
  res.setHeader("Access-Control-Allow-Origin", "https://nicholas-apolinario03.github.io");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

export default async function handler(req, res) {
  setCors(res);

  // ✅ Preflight
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido" });
  }

  try {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({ error: "Code não recebido" });
    }

    const response = await axios.post(
      "https://api.mercadolibre.com/oauth/token",
      new URLSearchParams({
        grant_type: "authorization_code",
        client_id: process.env.ML_CLIENT_ID,
        client_secret: process.env.ML_CLIENT_SECRET,
        redirect_uri: process.env.REDIRECT_URI,
        code
      }).toString(),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        }
      }
    );

    return res.status(200).json(response.data);

  } catch (err) {
    console.error("Erro ML:", err.response?.data || err.message);

    // ⚠️ ATENÇÃO: mesmo erro precisa de CORS
    return res.status(401).json({
      error: "Unauthorized",
      detalhe: err.response?.data
    });
  }
}
