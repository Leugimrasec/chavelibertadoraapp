from flask import Blueprint, jsonify, request
from flask_cors import cross_origin
from src.models.user import Meta, Transacao, db
from datetime import datetime, date
from sqlalchemy import func, extract

meta_bp = Blueprint('meta', __name__)

@meta_bp.route('/metas/<int:user_id>', methods=['GET'])
@cross_origin()
def get_metas(user_id):
    try:
        metas = Meta.query.filter_by(id_usuario=user_id).order_by(Meta.ano.desc(), Meta.mes.desc()).all()
        return jsonify([meta.to_dict() for meta in metas]), 200
    except Exception as e:
        return jsonify({'erro': str(e)}), 500

@meta_bp.route('/metas', methods=['POST'])
@cross_origin()
def criar_meta():
    try:
        data = request.json
        
        # Verificar se já existe meta para o mês/ano
        meta_existente = Meta.query.filter_by(
            id_usuario=data['id_usuario'],
            mes=data['mes'],
            ano=data['ano']
        ).first()
        
        if meta_existente:
            return jsonify({'erro': 'Já existe uma meta para este período'}), 400
        
        meta = Meta(
            id_usuario=data['id_usuario'],
            valor_meta=data['valor_meta'],
            mes=data['mes'],
            ano=data['ano']
        )
        
        db.session.add(meta)
        db.session.commit()
        
        return jsonify({
            'mensagem': 'Meta criada com sucesso',
            'meta': meta.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'erro': str(e)}), 500

@meta_bp.route('/metas/<int:meta_id>', methods=['PUT'])
@cross_origin()
def atualizar_meta(meta_id):
    try:
        meta = Meta.query.get_or_404(meta_id)
        data = request.json
        
        meta.valor_meta = data.get('valor_meta', meta.valor_meta)
        meta.data_atualizacao = datetime.utcnow()
        
        db.session.commit()
        
        return jsonify({
            'mensagem': 'Meta atualizada com sucesso',
            'meta': meta.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'erro': str(e)}), 500

@meta_bp.route('/metas/<int:meta_id>/progresso', methods=['GET'])
@cross_origin()
def calcular_progresso(meta_id):
    try:
        meta = Meta.query.get_or_404(meta_id)
        
        # Calcular economia do mês (receitas - despesas)
        receitas = db.session.query(func.sum(Transacao.valor)).filter(
            Transacao.id_usuario == meta.id_usuario,
            Transacao.tipo == 'receita',
            extract('month', Transacao.data_transacao) == meta.mes,
            extract('year', Transacao.data_transacao) == meta.ano
        ).scalar() or 0
        
        despesas = db.session.query(func.sum(Transacao.valor)).filter(
            Transacao.id_usuario == meta.id_usuario,
            Transacao.tipo == 'despesa',
            extract('month', Transacao.data_transacao) == meta.mes,
            extract('year', Transacao.data_transacao) == meta.ano
        ).scalar() or 0
        
        economia_atual = float(receitas) - float(despesas)
        progresso_percentual = (economia_atual / float(meta.valor_meta)) * 100 if meta.valor_meta > 0 else 0
        
        # Atualizar progresso na meta
        meta.progresso = min(progresso_percentual, 100)
        db.session.commit()
        
        return jsonify({
            'meta_id': meta.id,
            'valor_meta': float(meta.valor_meta),
            'economia_atual': economia_atual,
            'progresso_percentual': progresso_percentual,
            'status': 'atingida' if progresso_percentual >= 100 else 'em_progresso'
        }), 200
        
    except Exception as e:
        return jsonify({'erro': str(e)}), 500

@meta_bp.route('/metas/atual/<int:user_id>', methods=['GET'])
@cross_origin()
def get_meta_atual(user_id):
    try:
        hoje = date.today()
        
        meta_atual = Meta.query.filter_by(
            id_usuario=user_id,
            mes=hoje.month,
            ano=hoje.year
        ).first()
        
        if not meta_atual:
            return jsonify({'mensagem': 'Nenhuma meta definida para o mês atual'}), 404
        
        # Calcular progresso
        receitas = db.session.query(func.sum(Transacao.valor)).filter(
            Transacao.id_usuario == user_id,
            Transacao.tipo == 'receita',
            extract('month', Transacao.data_transacao) == hoje.month,
            extract('year', Transacao.data_transacao) == hoje.year
        ).scalar() or 0
        
        despesas = db.session.query(func.sum(Transacao.valor)).filter(
            Transacao.id_usuario == user_id,
            Transacao.tipo == 'despesa',
            extract('month', Transacao.data_transacao) == hoje.month,
            extract('year', Transacao.data_transacao) == hoje.year
        ).scalar() or 0
        
        economia_atual = float(receitas) - float(despesas)
        progresso_percentual = (economia_atual / float(meta_atual.valor_meta)) * 100 if meta_atual.valor_meta > 0 else 0
        
        return jsonify({
            'meta': meta_atual.to_dict(),
            'economia_atual': economia_atual,
            'progresso_percentual': min(progresso_percentual, 100)
        }), 200
        
    except Exception as e:
        return jsonify({'erro': str(e)}), 500

