import type {
  DespesaFixa,
  DespesaInput,
  Produto,
  ProdutoInput,
  RelatorioMensal,
  Venda,
  VendaInput,
} from '../types'

const BASE = import.meta.env.VITE_API_URL ?? '/api'

export class ApiError extends Error {
  status: number
  detalhes: Array<{ campo: string; mensagem: string }>

  constructor(status: number, message: string, detalhes: ApiError['detalhes'] = []) {
    super(message)
    this.status = status
    this.detalhes = detalhes
  }
}

async function http<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response
  try {
    res = await fetch(`${BASE}${path}`, {
      ...init,
      headers: { 'Content-Type': 'application/json', ...init?.headers },
    })
  } catch {
    throw new ApiError(0, 'Não foi possível conectar à API. Ela está rodando?')
  }

  if (res.status === 204) return undefined as T
  const body = await res.json().catch(() => ({}))
  if (!res.ok) {
    const detalhes = body.detalhes ?? []
    const msg = detalhes.length
      ? detalhes.map((d: { mensagem: string }) => d.mensagem).join(' · ')
      : (body.erro ?? `Erro ${res.status}`)
    throw new ApiError(res.status, msg, detalhes)
  }
  return body as T
}

const json = (method: string, data: unknown): RequestInit => ({ method, body: JSON.stringify(data) })
const mesQS = (mes?: string) => (mes ? `?mes=${mes}` : '')

export const api = {
  produtos: {
    listar: () => http<Produto[]>('/produtos'),
    criar: (p: ProdutoInput) => http<Produto>('/produtos', json('POST', p)),
    atualizar: (id: number, p: ProdutoInput) => http<Produto>(`/produtos/${id}`, json('PUT', p)),
    remover: (id: number) => http<void>(`/produtos/${id}`, { method: 'DELETE' }),
  },
  despesas: {
    listar: (mes?: string) => http<DespesaFixa[]>(`/despesas${mesQS(mes)}`),
    criar: (d: DespesaInput) => http<DespesaFixa>('/despesas', json('POST', d)),
    atualizar: (id: number, d: DespesaInput) => http<DespesaFixa>(`/despesas/${id}`, json('PUT', d)),
    remover: (id: number) => http<void>(`/despesas/${id}`, { method: 'DELETE' }),
  },
  vendas: {
    listar: (mes?: string) => http<Venda[]>(`/vendas${mesQS(mes)}`),
    criar: (v: VendaInput) => http<Venda>('/vendas', json('POST', v)),
    remover: (id: number) => http<void>(`/vendas/${id}`, { method: 'DELETE' }),
  },
  relatorios: {
    mensal: (mes: string) => http<RelatorioMensal>(`/relatorios/mensal?mes=${mes}`),
  },
}

export const mensagemErro = (e: unknown) => (e instanceof Error ? e.message : 'Erro inesperado')
