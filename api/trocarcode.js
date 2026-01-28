import axios from "axios";

export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Método não permitido" });
    }

    const { code } = req.body;

    if (!code) {
      return res.status(400).json({ error: "Code não recebido" });
    }

    console.log("Code recebido:", code);

    return res.status(200).json({ ok: true });

  } catch (err) {
    console.error("Erro na function:", err);
    return res.status(500).json({ error: "Erro interno" });
  }
}
