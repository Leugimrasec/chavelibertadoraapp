import os
import sys
# DON'T CHANGE THIS !!!
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from flask import Flask, send_from_directory
from flask_cors import CORS
from src.models.user import db
from src.routes.auth import auth_bp
from src.routes.transacao import transacao_bp
from src.routes.meta import meta_bp
from src.routes.missao import missao_bp
from src.routes.config import config_bp

app = Flask(__name__, static_folder=os.path.join(os.path.dirname(__file__), 'static'))
app.config['SECRET_KEY'] = 'chave_financeira_libertadora_2024'

# Configurar CORS para permitir requisições do frontend
CORS(app, origins="*")

# Registrar blueprints
app.register_blueprint(auth_bp, url_prefix='/api/auth')
app.register_blueprint(transacao_bp, url_prefix='/api')
app.register_blueprint(meta_bp, url_prefix='/api')
app.register_blueprint(missao_bp, url_prefix='/api')
app.register_blueprint(config_bp, url_prefix='/api')

# Configuração do banco de dados
app.config['SQLALCHEMY_DATABASE_URI'] = f"sqlite:///{os.path.join(os.path.dirname(__file__), 'database', 'app.db')}"
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db.init_app(app)

with app.app_context():
    db.create_all()

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    static_folder_path = app.static_folder
    if static_folder_path is None:
            return "Static folder not configured", 404

    if path != "" and os.path.exists(os.path.join(static_folder_path, path)):
        return send_from_directory(static_folder_path, path)
    else:
        index_path = os.path.join(static_folder_path, 'index.html')
        if os.path.exists(index_path):
            return send_from_directory(static_folder_path, 'index.html')
        else:
            return "index.html not found", 404

@app.route('/api/health', methods=['GET'])
def health_check():
    return {'status': 'OK', 'message': 'Chave Financeira Libertadora API está funcionando!'}, 200

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)

