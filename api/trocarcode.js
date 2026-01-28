import axios from "axios";

export default async function handler(req, res) {
    const { code } = req.body;

    console.log("Code recebido:", code);

    res.status(200).json({ ok: true });
}
const clientId = '3704242181199025';
const clientSecret = '6BE7sVvWH8u2BGam4DITcxusN8R0YMD3';
const redirectUri = 'https://nicholas-apolinario03.github.io/testecode.html';
const meuBotao = document.getElementById("meu-botao");

const tokenResponse = await axios.post('https://api.mercadolibre.com/oauth/token', null, {
    params: {
        grant_type: 'authorization_code',
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        code: id
    }
});

const { access_token, refresh_token } = tokenResponse.data;
console.log(tokenResponse.data);
