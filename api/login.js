import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { db } from "./bd.js";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { email, senha } = req.body;
  const SECRET = process.env.JWT_SECRET; 

  try {
    const result = await db.query("SELECT * FROM usuarios WHERE email = $1", [email]);
    
    if (result.rows.length === 0) return res.status(401).json({ error: "Usuário não encontrado" });

    const usuario = result.rows[0];
    const senhaValida = await bcrypt.compare(senha, usuario.senha);

    if (!senhaValida) return res.status(401).json({ error: "Senha inválida" });

    // Gera o Token (Equivalente ao ID da Session)
    const token = jwt.sign({ id: usuario.id, nome: usuario.nome }, SECRET, { expiresIn: '7d' });

    return res.status(200).json({ token, user: { nome: usuario.nome, email: usuario.email } });
  } catch (err) {
    return res.status(500).json({ error: "Erro no login" });
  }
}