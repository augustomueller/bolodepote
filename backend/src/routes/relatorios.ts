import { Router } from 'express'
import { createRepository } from '../db/jsonServer.js'
import { gerarRelatorioMensal } from '../services/financeiro.js'
import type { DespesaFixa, Produto, Venda } from '../types.js'
import { mesQueryOuAtual } from './params.js'

const vendas = createRepository<Venda>('vendas')
const despesas = createRepository<DespesaFixa>('despesasFixas')
const produtos = createRepository<Produto>('produtos')

export const relatoriosRouter = Router()

/** GET /api/relatorios/mensal?mes=2026-11 (padrão: mês atual) */
relatoriosRouter.get('/mensal', async (req, res) => {
  const mes = mesQueryOuAtual(req)
  const [v, d, p] = await Promise.all([vendas.list(), despesas.list(), produtos.list()])
  res.json(gerarRelatorioMensal(mes, v, d, p))
})
