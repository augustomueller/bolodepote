import { Router } from 'express'
import { z } from 'zod'
import { createRepository } from '../db/jsonServer.js'
import { HttpError } from '../middleware/errorHandler.js'
import { calcularValorTotal, pertenceAoMes } from '../services/financeiro.js'
import type { Produto, Venda, VendaDetalhada } from '../types.js'
import { dataSchema, idParam, mesQuery } from './params.js'

const vendas = createRepository<Venda>('vendas')
const produtos = createRepository<Produto>('produtos')

/**
 * O cliente envia só data, produto e quantidade.
 * Preço, custo e valor total são definidos pelo SERVIDOR a partir do cadastro
 * do produto — o front não consegue "inventar" um valor de venda.
 */
const vendaSchema = z.object({
  data: dataSchema,
  produtoId: z.number().int().positive('Selecione um produto'),
  quantidade: z.number().int('Quantidade deve ser inteira').positive('Quantidade deve ser maior que zero'),
})

async function montarVenda(input: z.infer<typeof vendaSchema>): Promise<Omit<Venda, 'id'>> {
  let produto: Produto
  try {
    produto = await produtos.get(input.produtoId)
  } catch (e) {
    if (e instanceof HttpError && e.status === 404) throw new HttpError(400, 'Produto não encontrado')
    throw e
  }
  if (!produto.ativo) throw new HttpError(400, `O produto "${produto.nome}" está desativado`)

  return {
    data: input.data,
    produtoId: produto.id,
    quantidade: input.quantidade,
    precoUnitario: produto.precoVenda,
    custoUnitario: produto.custoVariavel,
    valorTotal: calcularValorTotal(produto.precoVenda, input.quantidade),
  }
}

export const vendasRouter = Router()

/** GET /api/vendas?mes=2026-11 — mais recentes primeiro, com nome do produto */
vendasRouter.get('/', async (req, res) => {
  const mes = mesQuery(req)
  const [lista, prods] = await Promise.all([vendas.list(), produtos.list()])
  const nomes = new Map(prods.map((p) => [p.id, p.nome]))

  const resultado: VendaDetalhada[] = lista
    .filter((v) => !mes || pertenceAoMes(v.data, mes))
    .sort((a, b) => b.data.localeCompare(a.data) || b.id - a.id)
    .map((v) => ({ ...v, produtoNome: nomes.get(v.produtoId) ?? `Produto #${v.produtoId}` }))

  res.json(resultado)
})

vendasRouter.get('/:id', async (req, res) => {
  res.json(await vendas.get(idParam(req)))
})

vendasRouter.post('/', async (req, res) => {
  const venda = await montarVenda(vendaSchema.parse(req.body))
  res.status(201).json(await vendas.create(venda))
})

vendasRouter.put('/:id', async (req, res) => {
  const id = idParam(req)
  await vendas.get(id)
  const venda = await montarVenda(vendaSchema.parse(req.body))
  res.json(await vendas.update(id, venda))
})

vendasRouter.delete('/:id', async (req, res) => {
  await vendas.remove(idParam(req))
  res.status(204).end()
})
