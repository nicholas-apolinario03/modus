import bcrypt from "bcryptjs";
import { db } from "./bd.js";

export default async function handler(req, res) {
 res.status(200).json({ message: "API funcionando" });
  /*
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitiopópp´p´p´´do" });
  }

  try {
    const { nome, email, senha } = req.body;

    if (!nome || !email || !senha) {
      return res.status(400).json({ error: "Dados incompletos" });
    }

    // Verifica se email já existe
    const [rows] = await db.query(
      "SELECT id FROM users WHERE email = ?",
      [email]
    );

    if (rows.length > 0) {
      return res.status(409).json({ error: "Email já cadastrado" });
    }

    // Criptografa senha
    const hash = await bcrypt.hash(senha, 10);

    await db.query(
      "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
      [nome, email, hash]
    );

    return res.status(201).json({ message: "Usuário criado com sucesso" });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Erro interno" });
  }
    */
}
