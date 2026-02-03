import axios from 'axios';
import { db } from '../bd.js';

export async function garantirTokenValido(usuarioId) {
    // 1. Buscar os tokens atuais no banco
    const result = await db.query(
        'SELECT * FROM tokens_ml WHERE usuario_id = $1',
        [usuarioId]
    );

    if (result.rows.length === 0) throw new Error("Usuário não vinculado ao ML");

    const tokens = result.rows[0];
    const agora = new Date();
    
    // Adicionamos uma margem de segurança de 5 minutos
    const expiraEmBreve = new Date(tokens.expires_at_access.getTime() - 5 * 60000);

    if (agora < expiraEmBreve) {
        return tokens.access_token; // Token ainda é válido
    }

    // 2. Se expirou (ou vai expirar), renovar usando o Refresh Token
    try {
        const response = await axios.post('https://api.mercadolibre.com/oauth/token', null, {
            params: {
                grant_type: 'refresh_token',
                client_id: '3704242181199025',
                client_secret: process.env.ML_CLIENT_SECRET,
                refresh_token: tokens.refresh_token
            }
        });

        const { access_token, refresh_token, expires_in } = response.data;
        const novoExpiresAtAccess = new Date(Date.now() + expires_in * 1000);
        const novoExpiresAtRefresh = new Date(Date.now() + 180 * 24 * 60 * 60 * 1000); // + 6 meses

        // 3. Atualizar o banco com os novos tokens
        await db.query(`
            UPDATE tokens_ml 
            SET access_token = $1, refresh_token = $2, expires_at_access = $3, expires_at_refresh = $4, updated_at = CURRENT_TIMESTAMP
            WHERE usuario_id = $5`,
            [access_token, refresh_token, novoExpiresAtAccess, novoExpiresAtRefresh, usuarioId]
        );

        return access_token;
    } catch (error) {
        console.error("Erro ao renovar token:", error.response?.data || error.message);
        throw new Error("Sua conexão com o Mercado Livre expirou. Por favor, vincule novamente.");
    }
}