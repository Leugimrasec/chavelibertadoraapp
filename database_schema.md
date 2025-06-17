# Esquema do Banco de Dados - Chave Financeira Libertadora

## Tabela: Usuários
```sql
CREATE TABLE usuarios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    senha_hash VARCHAR(255) NOT NULL,
    data_criacao DATETIME DEFAULT CURRENT_TIMESTAMP,
    data_atualizacao DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

## Tabela: Transações
```sql
CREATE TABLE transacoes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    id_usuario INTEGER NOT NULL,
    tipo VARCHAR(10) NOT NULL CHECK (tipo IN ('receita', 'despesa')),
    valor DECIMAL(10,2) NOT NULL,
    categoria VARCHAR(50) NOT NULL,
    data_transacao DATE NOT NULL,
    descricao TEXT,
    data_criacao DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id) ON DELETE CASCADE
);
```

## Tabela: Metas
```sql
CREATE TABLE metas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    id_usuario INTEGER NOT NULL,
    valor_meta DECIMAL(10,2) NOT NULL,
    mes INTEGER NOT NULL CHECK (mes BETWEEN 1 AND 12),
    ano INTEGER NOT NULL,
    progresso DECIMAL(5,2) DEFAULT 0.00,
    data_criacao DATETIME DEFAULT CURRENT_TIMESTAMP,
    data_atualizacao DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id) ON DELETE CASCADE,
    UNIQUE(id_usuario, mes, ano)
);
```

## Tabela: Missões
```sql
CREATE TABLE missoes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    id_usuario INTEGER NOT NULL,
    descricao VARCHAR(255) NOT NULL,
    tipo VARCHAR(50) NOT NULL,
    status VARCHAR(20) DEFAULT 'pendente' CHECK (status IN ('pendente', 'concluida', 'expirada')),
    data_inicio DATE NOT NULL,
    data_fim DATE NOT NULL,
    recompensa VARCHAR(100),
    data_criacao DATETIME DEFAULT CURRENT_TIMESTAMP,
    data_conclusao DATETIME,
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id) ON DELETE CASCADE
);
```

## Tabela: Configurações
```sql
CREATE TABLE configuracoes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    id_usuario INTEGER NOT NULL,
    moeda VARCHAR(3) DEFAULT 'BRL' CHECK (moeda IN ('BRL', 'USD', 'EUR')),
    idioma VARCHAR(5) DEFAULT 'pt-BR' CHECK (idioma IN ('pt-BR', 'en-US')),
    modo_escuro BOOLEAN DEFAULT FALSE,
    backup_ativo BOOLEAN DEFAULT TRUE,
    notificacoes_ativas BOOLEAN DEFAULT TRUE,
    data_criacao DATETIME DEFAULT CURRENT_TIMESTAMP,
    data_atualizacao DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id) ON DELETE CASCADE,
    UNIQUE(id_usuario)
);
```

## Índices para Otimização
```sql
CREATE INDEX idx_transacoes_usuario_data ON transacoes(id_usuario, data_transacao);
CREATE INDEX idx_transacoes_categoria ON transacoes(categoria);
CREATE INDEX idx_metas_usuario_periodo ON metas(id_usuario, ano, mes);
CREATE INDEX idx_missoes_usuario_status ON missoes(id_usuario, status);
```

## Categorias Padrão
As seguintes categorias serão pré-definidas no sistema:

### Receitas:
- Salário
- Freelance
- Investimentos
- Outros

### Despesas:
- Alimentação
- Transporte
- Moradia
- Saúde
- Educação
- Lazer
- Compras
- Contas
- Outros

