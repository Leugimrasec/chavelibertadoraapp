from flask import Blueprint, jsonify, request
from flask_cors import cross_origin
from src.models.user import Transacao, Usuario, db
from datetime import datetime, date
from sqlalchemy import func, extract

transacao_bp = Blueprint('transacao', __name__)

@transacao_bp.route('/transacoes/<int:user_id>', methods=['GET'])
@cross_origin()
def get_transacoes(user_id):
    try:
        transacoes = Transacao.query.filter_by(id_usuario=user_id).order_by(Transacao.data_transacao.desc()).all()
        return jsonify([transacao.to_dict() for transacao in transacoes]), 200
    except Exception as e:
        return jsonify({'erro': str(e)}), 500

@transacao_bp.route('/transacoes', methods=['POST'])
@cross_origin()
def criar_transacao():
    try:
        data = request.json
        
        transacao = Transacao(
            id_usuario=data['id_usuario'],
            tipo=data['tipo'],
            valor=data['valor'],
            categoria=data['categoria'],
            data_transacao=datetime.strptime(data['data_transacao'], '%Y-%m-%d').date(),
            descricao=data.get('descricao', '')
        )
        
        db.session.add(transacao)
        db.session.commit()
        
        return jsonify({
            'mensagem': 'Transação criada com sucesso',
            'transacao': transacao.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'erro': str(e)}), 500

@transacao_bp.route('/transacoes/<int:transacao_id>', methods=['PUT'])
@cross_origin()
def atualizar_transacao(transacao_id):
    try:
        transacao = Transacao.query.get_or_404(transacao_id)
        data = request.json
        
        transacao.tipo = data.get('tipo', transacao.tipo)
        transacao.valor = data.get('valor', transacao.valor)
        transacao.categoria = data.get('categoria', transacao.categoria)
        transacao.descricao = data.get('descricao', transacao.descricao)
        
        if 'data_transacao' in data:
            transacao.data_transacao = datetime.strptime(data['data_transacao'], '%Y-%m-%d').date()
        
        db.session.commit()
        
        return jsonify({
            'mensagem': 'Transação atualizada com sucesso',
            'transacao': transacao.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'erro': str(e)}), 500

@transacao_bp.route('/transacoes/<int:transacao_id>', methods=['DELETE'])
@cross_origin()
def deletar_transacao(transacao_id):
    try:
        transacao = Transacao.query.get_or_404(transacao_id)
        db.session.delete(transacao)
        db.session.commit()
        
        return jsonify({'mensagem': 'Transação deletada com sucesso'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'erro': str(e)}), 500

@transacao_bp.route('/dashboard/<int:user_id>', methods=['GET'])
@cross_origin()
def get_dashboard(user_id):
    try:
        hoje = date.today()
        mes_atual = hoje.month
        ano_atual = hoje.year
        
        # Calcular totais do mês atual
        receitas = db.session.query(func.sum(Transacao.valor)).filter(
            Transacao.id_usuario == user_id,
            Transacao.tipo == 'receita',
            extract('month', Transacao.data_transacao) == mes_atual,
            extract('year', Transacao.data_transacao) == ano_atual
        ).scalar() or 0
        
        despesas = db.session.query(func.sum(Transacao.valor)).filter(
            Transacao.id_usuario == user_id,
            Transacao.tipo == 'despesa',
            extract('month', Transacao.data_transacao) == mes_atual,
            extract('year', Transacao.data_transacao) == ano_atual
        ).scalar() or 0
        
        saldo_atual = float(receitas) - float(despesas)
        
        return jsonify({
            'saldo_atual': saldo_atual,
            'total_receita': float(receitas),
            'total_despesa': float(despesas),
            'mes': mes_atual,
            'ano': ano_atual
        }), 200
        
    except Exception as e:
        return jsonify({'erro': str(e)}), 500

@transacao_bp.route('/relatorios/<int:user_id>', methods=['GET'])
@cross_origin()
def get_relatorios(user_id):
    try:
        # Relatório por categoria (últimos 30 dias)
        categorias = db.session.query(
            Transacao.categoria,
            func.sum(Transacao.valor).label('total')
        ).filter(
            Transacao.id_usuario == user_id,
            Transacao.tipo == 'despesa'
        ).group_by(Transacao.categoria).all()
        
        # Relatório mensal (últimos 6 meses)
        relatorio_mensal = db.session.query(
            extract('month', Transacao.data_transacao).label('mes'),
            extract('year', Transacao.data_transacao).label('ano'),
            func.sum(Transacao.valor).label('total')
        ).filter(
            Transacao.id_usuario == user_id,
            Transacao.tipo == 'despesa'
        ).group_by(
            extract('month', Transacao.data_transacao),
            extract('year', Transacao.data_transacao)
        ).order_by(
            extract('year', Transacao.data_transacao),
            extract('month', Transacao.data_transacao)
        ).limit(6).all()
        
        return jsonify({
            'por_categoria': [{'categoria': cat.categoria, 'total': float(cat.total)} for cat in categorias],
            'mensal': [{'mes': rel.mes, 'ano': rel.ano, 'total': float(rel.total)} for rel in relatorio_mensal]
        }), 200
        
    except Exception as e:
        return jsonify({'erro': str(e)}), 500

