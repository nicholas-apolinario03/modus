from http.server import BaseHTTPRequestHandler
import json
import requests

# Substitua por seu token de acesso
ACCESS_TOKEN = 'APP_USR-3704242181199025-052809-ef0f7bd5efacd9e0df113aa937612b1c-1357030258'

class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        # Pegando parâmetros da URL, ex.: ?order_id=123456
        from urllib.parse import parse_qs, urlparse
        query_components = parse_qs(urlparse(self.path).query)
        order_id = query_components.get("order_id", [None])[0]

        if order_id is None:
            self.send_response(400)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({"error": "Parâmetro 'order_id' obrigatório."}).encode())
            return

        url = f"https://api.mercadolibre.com/orders/{order_id}"
        headers = {
            'Authorization': f'Bearer {ACCESS_TOKEN}',
            'x-version': '2'
        }

        response = requests.get(url, headers=headers)

        if response.status_code == 200:
            pedido = response.json()
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps(pedido, ensure_ascii=False).encode())
        else:
            self.send_response(response.status_code)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({
                "error": f"Erro ao buscar pedido. Status {response.status_code}",
                "message": response.text
            }).encode())
