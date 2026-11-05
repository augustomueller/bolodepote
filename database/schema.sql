
CREATE TABLE Produtos (
    id              SERIAL          PRIMARY KEY,
    nome            VARCHAR(100)    NOT NULL UNIQUE,
    preco_venda     NUMERIC(10,2)   NOT NULL CHECK (preco_venda > 0),
    custo_variavel  NUMERIC(10,2)   NOT NULL CHECK (custo_variavel >= 0),
    margem_bruta    NUMERIC(10,2)   GENERATED ALWAYS AS (preco_venda - custo_variavel) STORED,
    ativo           BOOLEAN         NOT NULL DEFAULT TRUE,
    criado_em       TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE DespesasFixas (
    id               SERIAL          PRIMARY KEY,
    nome             VARCHAR(100)    NOT NULL,
    valor_mensal     NUMERIC(10,2)   NOT NULL CHECK (valor_mensal >= 0),
    data_referencia  DATE            NOT NULL,
    criado_em        TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_despesas_data_referencia ON DespesasFixas (data_referencia);


CREATE TABLE Vendas (
    id              SERIAL          PRIMARY KEY,
    data_venda      DATE            NOT NULL,
    produto_id      INTEGER         NOT NULL REFERENCES Produtos (id) ON DELETE RESTRICT,
    quantidade      INTEGER         NOT NULL CHECK (quantidade > 0),
    preco_unitario  NUMERIC(10,2)   NOT NULL CHECK (preco_unitario >= 0),
    custo_unitario  NUMERIC(10,2)   NOT NULL CHECK (custo_unitario >= 0),
    valor_total     NUMERIC(12,2)   GENERATED ALWAYS AS (quantidade * preco_unitario) STORED,
    criado_em       TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_vendas_data_venda ON Vendas (data_venda);
CREATE INDEX idx_vendas_produto    ON Vendas (produto_id);

INSERT INTO Produtos (nome, preco_venda, custo_variavel) VALUES
    ('Cupcake', 8.00, 4.50);

INSERT INTO DespesasFixas (nome, valor_mensal, data_referencia) VALUES
    ('Internet',         120.00, '2026-11-10'),
    ('Energia Elétrica', 230.00, '2026-11-15'),
    ('Água',              90.00, '2026-11-20');
