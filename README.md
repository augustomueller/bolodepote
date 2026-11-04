# Bolo de Pote — Gestão financeira da confeitaria

Sistema para a Maria registrar vendas, cadastrar produtos, lançar despesas fixas
e acompanhar o **lucro líquido** e o **ponto de equilíbrio** do mês.

```
database/schema.sql   Modelagem SQL (Produtos, DespesasFixas, Vendas)
backend/              API REST Node.js + TypeScript (Express) — regras de negócio
backend/db.json       Banco json-server (mesmas 3 tabelas como coleções)
bolodepote/           Frontend Vue 3 + Vite + TypeScript + Pinia
```

Arquitetura: `Vue (5173) → /api proxy → API Express (3333) → json-server (3001)`.
O json-server só persiste; todos os cálculos ficam na API.

## Como rodar

```bash
# Terminal 1 — banco + API
cd backend
npm install
npm run dev        # json-server :3001 + API :3333

# Terminal 2 — frontend
cd bolodepote
npm install
npm run dev        # http://localhost:5173
```

`npm run db:reset` (em `backend/`) restaura o banco para os dados iniciais.

## Endpoints

| Método | Rota | Descrição |
|---|---|---|
| GET/POST | `/api/produtos` | Lista (com `margemBruta` calculada) / cria |
| GET/PUT/DELETE | `/api/produtos/:id` | Excluir é bloqueado (409) se houver vendas — desative o produto |
| GET/POST | `/api/despesas?mes=AAAA-MM` | Lista despesas do mês / lança despesa |
| GET/PUT/DELETE | `/api/despesas/:id` | |
| GET/POST | `/api/vendas?mes=AAAA-MM` | Lista / registra venda (`{ data, produtoId, quantidade }`) |
| GET/PUT/DELETE | `/api/vendas/:id` | |
| GET | `/api/relatorios/mensal?mes=AAAA-MM` | Faturamento, custos, lucro líquido, ponto de equilíbrio |

## Regras de negócio

- **Margem bruta** = preço de venda − custo variável.
- **Venda**: o servidor grava preço e custo unitários *do momento da venda* e calcula
  o valor total. Reajustar o preço depois não altera o lucro de meses anteriores.
- **Lucro líquido** = faturamento − custo variável total − custos fixos do mês.
- **Ponto de equilíbrio** = custos fixos ÷ margem de contribuição por unidade, arredondado
  para cima. Hoje: 440,00 ÷ (8,00 − 4,50) = 125,7 → **126 cupcakes/mês**.
  Com vários produtos, usa a margem média ponderada pelo mix de vendas do mês.
- Despesas fixas entram no mês da sua **data de referência/vencimento**; cada mês tem
  seus próprios lançamentos.
- Valores monetários são calculados em centavos inteiros para evitar erros de arredondamento.
