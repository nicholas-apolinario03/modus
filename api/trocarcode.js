import axios from "axios";
import { URLSearchParams } from "url";

export default async function handler(req, res) {

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Método não permitido" });
    }

    const { code } = req.body || {};

    if (!code) {
      return res.status(400).json({ error: "Code não recebido" });
    }

    if (!process.env.ML_CLIENT_ID || !process.env.ML_CLIENT_SECRET || !process.env.REDIRECT_URI) {
      return res.status(500).json({ error: "Variáveis de ambiente não configuradas" });
    }

    const params = new URLSearchParams({
      grant_type: "authorization_code",
      client_id: process.env.ML_CLIENT_ID,
      client_secret: process.env.ML_CLIENT_SECRET,
      redirect_uri: process.env.REDIRECT_URI,
      code
    });

    const response = await axios.post(
      "https://api.mercadolibre.com/oauth/token",
      params.toString(),
      { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
    );

    return res.status(200).json(response.data);

  } catch (err) {
    console.error("CRASH:", err);

    return res.status(500).json({
      error: "Internal Server Error",
      detalhe: err.message
    });
  }
}
