import { Router } from 'express'
import { z } from 'zod'
import { createRepository } from '../db/jsonServer.js'
import { HttpError } from '../middleware/errorHandler.js'
import { comMargem } from '../services/financeiro.js'
import type { Produto, Venda } from '../types.js'
import { idParam } from './params.js'

const produtos = createRepository<Produto>('produtos')
const vendas = createRepository<Venda>('vendas')

const produtoSchema = z
  .object({
    nome: z.string().trim().min(1, 'Informe o nome').max(100),
    precoVenda: z.number().positive('Preço deve ser maior que zero'),
    custoVariavel: z.number().nonnegative('Custo não pode ser negativo'),
    ativo: z.boolean().default(true),
  })
  .refine((p) => p.custoVariavel <= p.precoVenda, {
    message: 'Custo variável maior que o preço de venda: o produto daria prejuízo',
    path: ['custoVariavel'],
  })

async function garantirNomeUnico(nome: string, ignorarId?: number) {
  const lista = await produtos.list()
  const dup = lista.find((p) => p.nome.toLowerCase() === nome.toLowerCase() && p.id !== ignorarId)
  if (dup) throw new HttpError(409, `Já existe um produto chamado "${dup.nome}"`)
}

export const produtosRouter = Router()

produtosRouter.get('/', async (_req, res) => {
  const lista = await produtos.list()
  res.json(lista.map(comMargem).sort((a, b) => a.nome.localeCompare(b.nome)))
})

produtosRouter.get('/:id', async (req, res) => {
  res.json(comMargem(await produtos.get(idParam(req))))
})

produtosRouter.post('/', async (req, res) => {
  const data = produtoSchema.parse(req.body)
  await garantirNomeUnico(data.nome)
  res.status(201).json(comMargem(await produtos.create(data)))
})

produtosRouter.put('/:id', async (req, res) => {
  const id = idParam(req)
  const data = produtoSchema.parse(req.body)
  await produtos.get(id) // 404 se não existir
  await garantirNomeUnico(data.nome, id)
  res.json(comMargem(await produtos.update(id, data)))
})

produtosRouter.delete('/:id', async (req, res) => {
  const id = idParam(req)
  // Equivalente ao ON DELETE RESTRICT do SQL: não apaga histórico de vendas.
  const temVendas = (await vendas.list()).some((v) => v.produtoId === id)
  if (temVendas) {
    throw new HttpError(409, 'Produto possui vendas registradas. Desative-o em vez de excluir.')
  }
  await produtos.remove(id)
  res.status(204).end()
})
