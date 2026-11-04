import type { Request } from 'express'
import { z } from 'zod'
import { HttpError } from '../middleware/errorHandler.js'
import { MES_REGEX, mesAtual } from '../services/financeiro.js'

export const dataSchema = z.iso.date({ message: 'Data inválida (use AAAA-MM-DD)' })

export function idParam(req: Request): number {
  const id = Number(req.params.id)
  if (!Number.isInteger(id) || id <= 0) throw new HttpError(400, 'ID inválido')
  return id
}

/** Lê ?mes=YYYY-MM. Retorna undefined se ausente (= sem filtro). */
export function mesQuery(req: Request): string | undefined {
  const mes = req.query.mes
  if (mes === undefined) return undefined
  if (typeof mes !== 'string' || !MES_REGEX.test(mes)) {
    throw new HttpError(400, 'Parâmetro "mes" inválido (use AAAA-MM)')
  }
  return mes
}

export const mesQueryOuAtual = (req: Request) => mesQuery(req) ?? mesAtual()
