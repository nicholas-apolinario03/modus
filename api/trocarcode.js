import axios from 'axios';
import { db } from './bd.js';

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).send('Método não permitido');

    const { code, usuarioId } = req.body;

    try {
        // 1. Trocar o CODE pelo Token no Mercado Livre
        // Importante: use o seu CLIENT_SECRET que está no .env da Vercel
        const response = await axios.post('https://api.mercadolibre.com/oauth/token', null, {
            params: {
                grant_type: 'authorization_code',
                client_id: '3704242181199025',
                client_secret: process.env.ML_CLIENT_SECRET, 
                code: code,
                redirect_uri: 'https://modus-three.vercel.app/dashboard'
            },
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        });

        const { access_token, refresh_token, expires_in, user_id: userIdMl } = response.data;

        // 2. Calcular as datas de expiração baseadas no horário atual de SP
        const expiresAtAccess = new Date(Date.now() + expires_in * 1000); // Geralmente 6h
        const expiresAtRefresh = new Date(Date.now() + 180 * 24 * 60 * 60 * 1000); // 6 meses (180 dias)

        // 3. Salvar na sua nova tabela tokens_ml
        // Usamos ON CONFLICT para atualizar caso o usuário já tenha um token salvo
        const query = `
            INSERT INTO tokens_ml (usuario_id, access_token, refresh_token, expires_at_access, expires_at_refresh, user_id_ml)
            VALUES ($1, $2, $3, $4, $5, $6)
            ON CONFLICT (usuario_id) 
            DO UPDATE SET 
                access_token = EXCLUDED.access_token,
                refresh_token = EXCLUDED.refresh_token,
                expires_at_access = EXCLUDED.expires_at_access,
                expires_at_refresh = EXCLUDED.expires_at_refresh,
                user_id_ml = EXCLUDED.user_id_ml,
                updated_at = CURRENT_TIMESTAMP;
        `;

        await db.query(query, [usuarioId, access_token, refresh_token, expiresAtAccess, expiresAtRefresh, userIdMl]);

        return res.status(200).json({ message: "Tokens salvos com sucesso!" });

    } catch (error) {
        console.error("Erro no ML:", error.response?.data || error.message);
        return res.status(500).json({ error: "Erro ao trocar o código do Mercado Livre" });
    }
}