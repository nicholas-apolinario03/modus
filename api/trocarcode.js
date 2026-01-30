import axios from "axios";
export default async function handler(req, res) {

    if (req.method === "OPTIONS") {
        return res.status(200).end();
    }

    if (req.method !== "POST") {
        return res.status(405).json({ error: "Método não permitido", code });
    }
    const { code } = req.body;

    if (!code) {
        return res.status(400).json({ error: "Code não informado" });
    }

    return res.status(200).json({ ok: true });
}
const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI;

const tokenResponse = await axios.post('https://api.mercadolibre.com/oauth/token', null, {
    params: {
        grant_type: 'authorization_code',
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        redirect_uri: REDIRECT_URI,
        code: code
    }
});
const { access_token, refresh_token } = tokenResponse.data;
return res.status(200).json({tokenResponse});








