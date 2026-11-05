import { Router } from 'express'
import { z } from 'zod'
import { createRepository } from '../db/jsonServer.js'
import { pertenceAoMes } from '../services/financeiro.js'
import type { DespesaFixa } from '../types.js'
import { dataSchema, idParam, mesQuery } from './params.js'

const despesas = createRepository<DespesaFixa>('despesasFixas')

const despesaSchema = z.object({
  nome: z.string().trim().min(1, 'Informe o nome').max(100),
  valorMensal: z.number().nonnegative('Valor não pode ser negativo'),
  dataReferencia: dataSchema,
})

export const despesasRouter = Router()

/** GET /api/despesas?mes=2026-11 */
despesasRouter.get('/', async (req, res) => {
  const mes = mesQuery(req)
  const lista = await despesas.list()
  res.json(
    lista
      .filter((d) => !mes || pertenceAoMes(d.dataReferencia, mes))
      .sort((a, b) => a.dataReferencia.localeCompare(b.dataReferencia)),
  )
})

despesasRouter.get('/:id', async (req, res) => {
  res.json(await despesas.get(idParam(req)))
})

despesasRouter.post('/', async (req, res) => {
  res.status(201).json(await despesas.create(despesaSchema.parse(req.body)))
})

despesasRouter.put('/:id', async (req, res) => {
  const id = idParam(req)
  const data = despesaSchema.parse(req.body)
  await despesas.get(id)
  res.json(await despesas.update(id, data))
})

despesasRouter.delete('/:id', async (req, res) => {
  await despesas.remove(idParam(req))
  res.status(204).end()
})
