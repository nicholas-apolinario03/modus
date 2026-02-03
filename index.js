import express from 'express';
import cors from 'cors';
// Importe seus handlers (garanta que trocarcode.js também tenha "export default")
import registerHandler from './api/register.js';
import trocarCodeHandler from './api/trocarcode.js';
import loginHandler from './api/login.js';

const app = express();

app.use(cors()); // Libera acesso para seu futuro React
app.use(express.json()); // Permite que o servidor entenda JSON no corpo da requisição

// Rota para o registro que você postou a imagem
app.all('/api/register', (req, res) => registerHandler(req, res));
app.all('/api/login', (req, res) => loginHandler(req, res));

// Rota para a troca de token do Mercado Livre
app.all('/api/trocarcode', (req, res) => trocarCodeHandler(req, res));

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});