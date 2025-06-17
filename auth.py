from flask import Blueprint, jsonify, request
from flask_cors import cross_origin
from src.models.user import Usuario, Configuracao, db
from datetime import datetime
import jwt

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/cadastro', methods=['POST'])
@cross_origin()
def cadastro():
    try:
        data = request.json
        
        # Verificar se o email já existe
        if Usuario.query.filter_by(email=data['email']).first():
            return jsonify({'erro': 'Email já cadastrado'}), 400
        
        # Criar novo usuário
        usuario = Usuario(
            nome=data['nome'],
            email=data['email']
        )
        usuario.set_senha(data['senha'])
        
        db.session.add(usuario)
        db.session.commit()
        
        # Criar configurações padrão
        config = Configuracao(id_usuario=usuario.id)
        db.session.add(config)
        db.session.commit()
        
        return jsonify({
            'mensagem': 'Usuário cadastrado com sucesso',
            'usuario': usuario.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'erro': str(e)}), 500

@auth_bp.route('/login', methods=['POST'])
@cross_origin()
def login():
    try:
        data = request.json
        
        usuario = Usuario.query.filter_by(email=data['email']).first()
        
        if usuario and usuario.check_senha(data['senha']):
            # Gerar token JWT (simplificado)
            token = jwt.encode({
                'user_id': usuario.id,
                'exp': datetime.utcnow().timestamp() + 86400  # 24 horas
            }, 'secret_key', algorithm='HS256')
            
            return jsonify({
                'mensagem': 'Login realizado com sucesso',
                'token': token,
                'usuario': usuario.to_dict()
            }), 200
        else:
            return jsonify({'erro': 'Email ou senha inválidos'}), 401
            
    except Exception as e:
        return jsonify({'erro': str(e)}), 500

@auth_bp.route('/perfil/<int:user_id>', methods=['GET'])
@cross_origin()
def get_perfil(user_id):
    try:
        usuario = Usuario.query.get_or_404(user_id)
        return jsonify(usuario.to_dict()), 200
    except Exception as e:
        return jsonify({'erro': str(e)}), 500

@auth_bp.route('/perfil/<int:user_id>', methods=['PUT'])
@cross_origin()
def update_perfil(user_id):
    try:
        usuario = Usuario.query.get_or_404(user_id)
        data = request.json
        
        usuario.nome = data.get('nome', usuario.nome)
        usuario.email = data.get('email', usuario.email)
        
        if 'senha' in data:
            usuario.set_senha(data['senha'])
        
        usuario.data_atualizacao = datetime.utcnow()
        db.session.commit()
        
        return jsonify({
            'mensagem': 'Perfil atualizado com sucesso',
            'usuario': usuario.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'erro': str(e)}), 500

