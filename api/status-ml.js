import { db } from './bd.js';

export default async function handler(req, res) {
    const { id } = req.query; 

    try {
        // Buscamos se existe QUALQUER token para este usuario_id
        const result = await db.query(
            'SELECT id FROM tokens_ml WHERE usuario_id = $1 LIMIT 1',
            [id]
        );

        // Se encontrou uma linha, retorna conectado: true
        if (result.rows.length > 0) {
            return res.status(200).json({ conectado: true });
        } else {
            return res.status(200).json({ conectado: false });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ conectado: false });
    }
}