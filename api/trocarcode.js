import axios from "axios";

export default async function handler(req, res) {

  // 🔓 CORS (obrigatório)
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido" });
  }

  const { code } = req.body;

  if (!code) {
    return res.status(400).json({ error: "Code não informado" });
  }

  try {
    const tokenResponse = await axios.post(
      "https://api.mercadolibre.com/oauth/token",
      new URLSearchParams({
        grant_type: "authorization_code",
        client_id: process.env.CLIENT_ID,
        client_secret: process.env.CLIENT_SECRET,
        redirect_uri: process.env.REDIRECT_URI,
        code
      }).toString(),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        }
      }
    );

    const { access_token, refresh_token } = tokenResponse.data;

    return res.status(200).json({
      access_token,
      refresh_token
    });

  } catch (err) {
    console.error("Erro ML:", err.response?.data || err.message);

    return res.status(500).json({
      error: "Falha ao trocar o code",
      detalhe: err.response?.data
    });
  }
}
