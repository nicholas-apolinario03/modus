import axios from "axios";

export default async function handler(req, res) {

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido" });
  }

  const { code } = req.body;

  if (!code) {
    return res.status(400).json({ error: "Code não recebido" });
  }

  try {
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

    return res.status(401).json({
      error: "Unauthorized",
      detalhe: err.response?.data
    });
  }
}
