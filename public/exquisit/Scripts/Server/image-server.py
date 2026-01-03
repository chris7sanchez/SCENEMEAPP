#!/usr/bin/env python3
"""
Servidor simple para generar imágenes astrológicas
Usa la API de generación de imágenes directamente
"""

from http.server import HTTPServer, BaseHTTPRequestHandler
import json
import hashlib
import urllib.parse

class ImageGeneratorHandler(BaseHTTPRequestHandler):
    
    def do_OPTIONS(self):
        """Handle CORS preflight"""
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, GET, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
    
    def do_POST(self):
        """Handle image generation request"""
        if self.path == '/generate-image':
            try:
                # Leer el body
                content_length = int(self.headers['Content-Length'])
                post_data = self.rfile.read(content_length)
                data = json.loads(post_data.decode('utf-8'))
                
                prompt = data.get('prompt', '')
                
                print(f"🎨 Generando imagen...")
                print(f"📝 Prompt: {prompt[:200]}...")
                
                # Por ahora, generar hash para placeholder
                # TODO: Aquí integrarías la API real de generación
                hash_value = hashlib.md5(prompt.encode()).hexdigest()[:10]
                image_url = f"https://picsum.photos/seed/{hash_value}/1024/1024"
                
                # Respuesta
                response = {
                    'success': True,
                    'imageUrl': image_url,
                    'prompt': prompt[:100] + '...'
                }
                
                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(json.dumps(response).encode())
                
                print(f"✅ Imagen generada: {image_url}")
                
            except Exception as e:
                print(f"❌ Error: {e}")
                self.send_response(500)
                self.send_header('Content-Type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                error_response = {'success': False, 'error': str(e)}
                self.wfile.write(json.dumps(error_response).encode())
        else:
            self.send_response(404)
            self.end_headers()
    
    def do_GET(self):
        """Health check"""
        if self.path == '/health':
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            response = {'status': 'ok', 'message': 'Alchemistery Image Server Running'}
            self.wfile.write(json.dumps(response).encode())
        else:
            self.send_response(404)
            self.end_headers()

def run_server(port=3000):
    server_address = ('', port)
    httpd = HTTPServer(server_address, ImageGeneratorHandler)
    print(f"🚀 Servidor de imágenes corriendo en http://localhost:{port}")
    print(f"💡 Endpoint: POST http://localhost:{port}/generate-image")
    print(f"🔧 Health check: GET http://localhost:{port}/health")
    httpd.serve_forever()

if __name__ == '__main__':
    run_server()
