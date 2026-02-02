import bcrypt from "bcryptjs";
import { db } from "./bd.js"; // Certifique-se que o bd.js agora usa 'pg'

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Método não permitido" });

  try {
    const { nome, email, senha } = req.body;

    if (!nome || !email || !senha) {
      return res.status(400).json({ error: "Dados incompletos" });
    }

    // Verifica se email já existe (Sintaxe Postgres $1)
    const result = await db.query("SELECT id FROM usuarios WHERE email = $1", [email]);

    if (result.rows.length > 0) {
      return res.status(409).json({ error: "Email já cadastrado" });
    }

   // Criptografa a senha
    const hash = await bcrypt.hash(senha, 10);

    // Inserção no Postgres (Sintaxe correta com placeholders e fechamento)
    await db.query(
      "INSERT INTO usuarios (nome, email, senha) VALUES ($1, $2, $3)",
      [nome, email, hash]
    );

    return res.status(201).json({ message: "Usuário criado com sucesso" });

  } catch (err) {
    console.error("Erro detalhado:", err); // Log importante para debugar no terminal
    return res.status(500).json({ error: "Erro interno no servidor" });
  }
}