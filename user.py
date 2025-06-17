from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime

db = SQLAlchemy()

class Usuario(db.Model):
    __tablename__ = 'usuarios'
    
    id = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(150), unique=True, nullable=False)
    senha_hash = db.Column(db.String(255), nullable=False)
    data_criacao = db.Column(db.DateTime, default=datetime.utcnow)
    data_atualizacao = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relacionamentos
    transacoes = db.relationship('Transacao', backref='usuario', lazy=True, cascade='all, delete-orphan')
    metas = db.relationship('Meta', backref='usuario', lazy=True, cascade='all, delete-orphan')
    missoes = db.relationship('Missao', backref='usuario', lazy=True, cascade='all, delete-orphan')
    configuracao = db.relationship('Configuracao', backref='usuario', uselist=False, cascade='all, delete-orphan')

    def set_senha(self, senha):
        self.senha_hash = generate_password_hash(senha)

    def check_senha(self, senha):
        return check_password_hash(self.senha_hash, senha)

    def to_dict(self):
        return {
            'id': self.id,
            'nome': self.nome,
            'email': self.email,
            'data_criacao': self.data_criacao.isoformat() if self.data_criacao else None,
            'data_atualizacao': self.data_atualizacao.isoformat() if self.data_atualizacao else None
        }

class Transacao(db.Model):
    __tablename__ = 'transacoes'
    
    id = db.Column(db.Integer, primary_key=True)
    id_usuario = db.Column(db.Integer, db.ForeignKey('usuarios.id'), nullable=False)
    tipo = db.Column(db.String(10), nullable=False)  # 'receita' ou 'despesa'
    valor = db.Column(db.Numeric(10, 2), nullable=False)
    categoria = db.Column(db.String(50), nullable=False)
    data_transacao = db.Column(db.Date, nullable=False)
    descricao = db.Column(db.Text)
    data_criacao = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'id_usuario': self.id_usuario,
            'tipo': self.tipo,
            'valor': float(self.valor),
            'categoria': self.categoria,
            'data_transacao': self.data_transacao.isoformat() if self.data_transacao else None,
            'descricao': self.descricao,
            'data_criacao': self.data_criacao.isoformat() if self.data_criacao else None
        }

class Meta(db.Model):
    __tablename__ = 'metas'
    
    id = db.Column(db.Integer, primary_key=True)
    id_usuario = db.Column(db.Integer, db.ForeignKey('usuarios.id'), nullable=False)
    valor_meta = db.Column(db.Numeric(10, 2), nullable=False)
    mes = db.Column(db.Integer, nullable=False)
    ano = db.Column(db.Integer, nullable=False)
    progresso = db.Column(db.Numeric(5, 2), default=0.00)
    data_criacao = db.Column(db.DateTime, default=datetime.utcnow)
    data_atualizacao = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    __table_args__ = (db.UniqueConstraint('id_usuario', 'mes', 'ano'),)

    def to_dict(self):
        return {
            'id': self.id,
            'id_usuario': self.id_usuario,
            'valor_meta': float(self.valor_meta),
            'mes': self.mes,
            'ano': self.ano,
            'progresso': float(self.progresso),
            'data_criacao': self.data_criacao.isoformat() if self.data_criacao else None,
            'data_atualizacao': self.data_atualizacao.isoformat() if self.data_atualizacao else None
        }

class Missao(db.Model):
    __tablename__ = 'missoes'
    
    id = db.Column(db.Integer, primary_key=True)
    id_usuario = db.Column(db.Integer, db.ForeignKey('usuarios.id'), nullable=False)
    descricao = db.Column(db.String(255), nullable=False)
    tipo = db.Column(db.String(50), nullable=False)
    status = db.Column(db.String(20), default='pendente')  # 'pendente', 'concluida', 'expirada'
    data_inicio = db.Column(db.Date, nullable=False)
    data_fim = db.Column(db.Date, nullable=False)
    recompensa = db.Column(db.String(100))
    data_criacao = db.Column(db.DateTime, default=datetime.utcnow)
    data_conclusao = db.Column(db.DateTime)

    def to_dict(self):
        return {
            'id': self.id,
            'id_usuario': self.id_usuario,
            'descricao': self.descricao,
            'tipo': self.tipo,
            'status': self.status,
            'data_inicio': self.data_inicio.isoformat() if self.data_inicio else None,
            'data_fim': self.data_fim.isoformat() if self.data_fim else None,
            'recompensa': self.recompensa,
            'data_criacao': self.data_criacao.isoformat() if self.data_criacao else None,
            'data_conclusao': self.data_conclusao.isoformat() if self.data_conclusao else None
        }

class Configuracao(db.Model):
    __tablename__ = 'configuracoes'
    
    id = db.Column(db.Integer, primary_key=True)
    id_usuario = db.Column(db.Integer, db.ForeignKey('usuarios.id'), nullable=False, unique=True)
    moeda = db.Column(db.String(3), default='BRL')  # 'BRL', 'USD', 'EUR'
    idioma = db.Column(db.String(5), default='pt-BR')  # 'pt-BR', 'en-US'
    modo_escuro = db.Column(db.Boolean, default=False)
    backup_ativo = db.Column(db.Boolean, default=True)
    notificacoes_ativas = db.Column(db.Boolean, default=True)
    data_criacao = db.Column(db.DateTime, default=datetime.utcnow)
    data_atualizacao = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'id_usuario': self.id_usuario,
            'moeda': self.moeda,
            'idioma': self.idioma,
            'modo_escuro': self.modo_escuro,
            'backup_ativo': self.backup_ativo,
            'notificacoes_ativas': self.notificacoes_ativas,
            'data_criacao': self.data_criacao.isoformat() if self.data_criacao else None,
            'data_atualizacao': self.data_atualizacao.isoformat() if self.data_atualizacao else None
        }

