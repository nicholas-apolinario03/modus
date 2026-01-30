export default async function handler(req, res) {
  
    if (req.method === "OPTIONS") {
        return res.status(200).end();
    }

    if (req.method !== "POST") {
        return res.status(405).json({ error: "Método não permitido"});
    }
      const { code } = req.body;

    if (!code) {
        return res.status(400).json({ error: "Code não informado" });
}
  return res.status(200).json({ ok: true });
}
