-- =============================================================================
-- Bolo de Pote — Modelagem do banco de dados (gestão financeira da confeitaria)
-- Dialeto: PostgreSQL (compatível com MySQL trocando SERIAL por AUTO_INCREMENT)
--
-- Observação: em desenvolvimento o projeto usa json-server (backend/db.json),
-- que espelha exatamente estas três tabelas como coleções:
--   produtos, despesasFixas, vendas
-- Os valores monetários são NUMERIC(10,2) (nunca FLOAT) para evitar erros de
-- arredondamento em dinheiro.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Produtos
-- margem_bruta é coluna GERADA: sempre igual a preco_venda - custo_variavel,
-- então nunca fica inconsistente.
-- -----------------------------------------------------------------------------
CREATE TABLE Produtos (
    id              SERIAL          PRIMARY KEY,
    nome            VARCHAR(100)    NOT NULL UNIQUE,
    preco_venda     NUMERIC(10,2)   NOT NULL CHECK (preco_venda > 0),
    custo_variavel  NUMERIC(10,2)   NOT NULL CHECK (custo_variavel >= 0),
    margem_bruta    NUMERIC(10,2)   GENERATED ALWAYS AS (preco_venda - custo_variavel) STORED,
    ativo           BOOLEAN         NOT NULL DEFAULT TRUE,
    criado_em       TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- -----------------------------------------------------------------------------
-- DespesasFixas
-- Cada linha é o lançamento de uma despesa em um mês. data_referencia define
-- a qual mês a despesa pertence no relatório (ex.: conta de luz de nov/2026).
-- -----------------------------------------------------------------------------
CREATE TABLE DespesasFixas (
    id               SERIAL          PRIMARY KEY,
    nome             VARCHAR(100)    NOT NULL,
    valor_mensal     NUMERIC(10,2)   NOT NULL CHECK (valor_mensal >= 0),
    data_referencia  DATE            NOT NULL,
    criado_em        TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_despesas_data_referencia ON DespesasFixas (data_referencia);

-- -----------------------------------------------------------------------------
-- Vendas
-- preco_unitario e custo_unitario são uma FOTOGRAFIA do produto no momento da
-- venda: se Maria reajustar o preço do cupcake em dezembro, as vendas de
-- novembro continuam com o lucro correto.
-- ON DELETE RESTRICT impede apagar um produto que já tem vendas.
-- -----------------------------------------------------------------------------
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

-- -----------------------------------------------------------------------------
-- Dados iniciais (cenário atual da Maria)
-- -----------------------------------------------------------------------------
INSERT INTO Produtos (nome, preco_venda, custo_variavel) VALUES
    ('Cupcake', 8.00, 4.50);

INSERT INTO DespesasFixas (nome, valor_mensal, data_referencia) VALUES
    ('Internet',         120.00, '2026-11-10'),
    ('Energia Elétrica', 230.00, '2026-11-15'),
    ('Água',              90.00, '2026-11-20');

-- -----------------------------------------------------------------------------
-- Relatório financeiro mensal (referência da regra implementada na API)
-- Ponto de equilíbrio = custo fixo / margem de contribuição média por unidade
-- -----------------------------------------------------------------------------
-- WITH v AS (
--     SELECT SUM(valor_total)                   AS faturamento,
--            SUM(quantidade * custo_unitario)   AS custo_variavel,
--            SUM(quantidade)                    AS unidades
--     FROM Vendas
--     WHERE data_venda >= DATE '2026-11-01' AND data_venda < DATE '2026-12-01'
-- ), d AS (
--     SELECT COALESCE(SUM(valor_mensal), 0) AS custo_fixo
--     FROM DespesasFixas
--     WHERE data_referencia >= DATE '2026-11-01' AND data_referencia < DATE '2026-12-01'
-- )
-- SELECT v.faturamento,
--        v.custo_variavel,
--        d.custo_fixo,
--        v.faturamento - v.custo_variavel - d.custo_fixo AS lucro_liquido
-- FROM v, d;
