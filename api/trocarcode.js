export default async function handler(req, res) {

  // 🔓 HEADERS CORS
  res.setHeader("Access-Control-Allow-Origin", "https://nicholas-apolinario03.github.io");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // 🛑 Preflight
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // 🚫 Bloqueia outros métodos
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido" });
  }

  try {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({ error: "Code não recebido" });
    }

    console.log("Code recebido:", code);

    // Aqui depois você troca pelo access_token
    return res.status(200).json({ ok: true, code });

  } catch (err) {
    console.error("Erro na function:", err);
    return res.status(500).json({ error: "Erro interno" });
  }
}
