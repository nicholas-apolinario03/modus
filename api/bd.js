import pg from 'pg';
const { Pool } = pg;
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), 'api/arq.env') });

export const db = new Pool({
  connectionString: process.env.POSTGRES_URL,
  ssl: {
    // Isso remove o warning e garante a compatibilidade recomendada
    rejectUnauthorized: false 
  },
  keepAlive: true, // Mantém a conexão "quente" para não cair
});
db.on('error', (err) => {
  console.error('Erro inesperado no cliente do Postgres', err);
});