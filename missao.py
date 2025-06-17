from flask import Blueprint, jsonify, request
from flask_cors import cross_origin
from src.models.user import Missao, db
from datetime import datetime, date, timedelta

missao_bp = Blueprint('missao', __name__)

@missao_bp.route('/missoes/<int:user_id>', methods=['GET'])
@cross_origin()
def get_missoes(user_id):
    try:
        missoes = Missao.query.filter_by(id_usuario=user_id).order_by(Missao.data_criacao.desc()).all()
        return jsonify([missao.to_dict() for missao in missoes]), 200
    except Exception as e:
        return jsonify({'erro': str(e)}), 500

@missao_bp.route('/missoes/ativas/<int:user_id>', methods=['GET'])
@cross_origin()
def get_missoes_ativas(user_id):
    try:
        hoje = date.today()
        missoes_ativas = Missao.query.filter(
            Missao.id_usuario == user_id,
            Missao.status == 'pendente',
            Missao.data_fim >= hoje
        ).all()
        
        return jsonify([missao.to_dict() for missao in missoes_ativas]), 200
    except Exception as e:
        return jsonify({'erro': str(e)}), 500

@missao_bp.route('/missoes', methods=['POST'])
@cross_origin()
def criar_missao():
    try:
        data = request.json
        
        missao = Missao(
            id_usuario=data['id_usuario'],
            descricao=data['descricao'],
            tipo=data['tipo'],
            data_inicio=datetime.strptime(data['data_inicio'], '%Y-%m-%d').date(),
            data_fim=datetime.strptime(data['data_fim'], '%Y-%m-%d').date(),
            recompensa=data.get('recompensa', 'Medalha Digital')
        )
        
        db.session.add(missao)
        db.session.commit()
        
        return jsonify({
            'mensagem': 'Missão criada com sucesso',
            'missao': missao.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'erro': str(e)}), 500

@missao_bp.route('/missoes/<int:missao_id>/concluir', methods=['PUT'])
@cross_origin()
def concluir_missao(missao_id):
    try:
        missao = Missao.query.get_or_404(missao_id)
        
        missao.status = 'concluida'
        missao.data_conclusao = datetime.utcnow()
        
        db.session.commit()
        
        return jsonify({
            'mensagem': 'Missão concluída com sucesso!',
            'missao': missao.to_dict(),
            'recompensa': missao.recompensa
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'erro': str(e)}), 500

@missao_bp.route('/missoes/semanais/<int:user_id>', methods=['POST'])
@cross_origin()
def gerar_missoes_semanais(user_id):
    try:
        hoje = date.today()
        inicio_semana = hoje - timedelta(days=hoje.weekday())
        fim_semana = inicio_semana + timedelta(days=6)
        
        # Verificar se já existem missões para esta semana
        missoes_existentes = Missao.query.filter(
            Missao.id_usuario == user_id,
            Missao.data_inicio >= inicio_semana,
            Missao.data_fim <= fim_semana,
            Missao.tipo == 'semanal'
        ).count()
        
        if missoes_existentes > 0:
            return jsonify({'mensagem': 'Missões semanais já foram geradas'}), 200
        
        # Missões semanais padrão
        missoes_padrao = [
            {
                'descricao': 'Registrar despesas por 5 dias seguidos',
                'tipo': 'semanal',
                'recompensa': 'Medalha de Disciplina'
            },
            {
                'descricao': 'Não ultrapassar o orçamento de alimentação',
                'tipo': 'semanal',
                'recompensa': 'Medalha de Controle'
            },
            {
                'descricao': 'Economizar pelo menos R$ 50 esta semana',
                'tipo': 'semanal',
                'recompensa': 'Medalha de Economia'
            }
        ]
        
        missoes_criadas = []
        for missao_data in missoes_padrao:
            missao = Missao(
                id_usuario=user_id,
                descricao=missao_data['descricao'],
                tipo=missao_data['tipo'],
                data_inicio=inicio_semana,
                data_fim=fim_semana,
                recompensa=missao_data['recompensa']
            )
            db.session.add(missao)
            missoes_criadas.append(missao)
        
        db.session.commit()
        
        return jsonify({
            'mensagem': 'Missões semanais geradas com sucesso',
            'missoes': [missao.to_dict() for missao in missoes_criadas]
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'erro': str(e)}), 500

