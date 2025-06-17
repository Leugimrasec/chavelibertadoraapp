from flask import Blueprint, jsonify, request
from flask_cors import cross_origin
from src.models.user import Configuracao, db
from datetime import datetime

config_bp = Blueprint('config', __name__)

@config_bp.route('/configuracoes/<int:user_id>', methods=['GET'])
@cross_origin()
def get_configuracoes(user_id):
    try:
        config = Configuracao.query.filter_by(id_usuario=user_id).first()
        
        if not config:
            # Criar configurações padrão se não existirem
            config = Configuracao(id_usuario=user_id)
            db.session.add(config)
            db.session.commit()
        
        return jsonify(config.to_dict()), 200
    except Exception as e:
        return jsonify({'erro': str(e)}), 500

@config_bp.route('/configuracoes/<int:user_id>', methods=['PUT'])
@cross_origin()
def atualizar_configuracoes(user_id):
    try:
        config = Configuracao.query.filter_by(id_usuario=user_id).first()
        
        if not config:
            config = Configuracao(id_usuario=user_id)
            db.session.add(config)
        
        data = request.json
        
        config.moeda = data.get('moeda', config.moeda)
        config.idioma = data.get('idioma', config.idioma)
        config.modo_escuro = data.get('modo_escuro', config.modo_escuro)
        config.backup_ativo = data.get('backup_ativo', config.backup_ativo)
        config.notificacoes_ativas = data.get('notificacoes_ativas', config.notificacoes_ativas)
        config.data_atualizacao = datetime.utcnow()
        
        db.session.commit()
        
        return jsonify({
            'mensagem': 'Configurações atualizadas com sucesso',
            'configuracoes': config.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'erro': str(e)}), 500

@config_bp.route('/configuracoes/<int:user_id>/reset', methods=['POST'])
@cross_origin()
def reset_dados(user_id):
    try:
        from src.models.user import Usuario, Transacao, Meta, Missao
        
        # Deletar todas as transações do usuário
        Transacao.query.filter_by(id_usuario=user_id).delete()
        
        # Deletar todas as metas do usuário
        Meta.query.filter_by(id_usuario=user_id).delete()
        
        # Deletar todas as missões do usuário
        Missao.query.filter_by(id_usuario=user_id).delete()
        
        # Resetar configurações para padrão
        config = Configuracao.query.filter_by(id_usuario=user_id).first()
        if config:
            config.moeda = 'BRL'
            config.idioma = 'pt-BR'
            config.modo_escuro = False
            config.backup_ativo = True
            config.notificacoes_ativas = True
            config.data_atualizacao = datetime.utcnow()
        
        db.session.commit()
        
        return jsonify({'mensagem': 'Dados resetados com sucesso'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'erro': str(e)}), 500

@config_bp.route('/categorias', methods=['GET'])
@cross_origin()
def get_categorias():
    try:
        categorias = {
            'receitas': [
                'Salário',
                'Freelance',
                'Investimentos',
                'Outros'
            ],
            'despesas': [
                'Alimentação',
                'Transporte',
                'Moradia',
                'Saúde',
                'Educação',
                'Lazer',
                'Compras',
                'Contas',
                'Outros'
            ]
        }
        
        return jsonify(categorias), 200
    except Exception as e:
        return jsonify({'erro': str(e)}), 500

