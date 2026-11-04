import { config } from '../config.js'
import { HttpError } from '../middleware/errorHandler.js'

/**
 * Cliente mínimo para o json-server, que faz o papel de banco de dados.
 * Toda regra de negócio fica na API; o json-server só persiste.
 */
async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response
  try {
    res = await fetch(`${config.jsonServerUrl}${path}`, {
      ...init,
      headers: { 'Content-Type': 'application/json', ...init?.headers },
    })
  } catch {
    throw new HttpError(503, `Banco de dados (json-server) indisponível em ${config.jsonServerUrl}`)
  }

  if (res.status === 404) throw new HttpError(404, 'Registro não encontrado')
  if (!res.ok) throw new HttpError(502, `Erro no banco de dados: ${res.status} ${res.statusText}`)
  return (await res.json()) as T
}

export type Colecao = 'produtos' | 'despesasFixas' | 'vendas'

export function createRepository<T extends { id: number }>(colecao: Colecao) {
  return {
    list: () => request<T[]>(`/${colecao}`),
    get: (id: number) => request<T>(`/${colecao}/${id}`),
    create: (data: Omit<T, 'id'>) =>
      request<T>(`/${colecao}`, { method: 'POST', body: JSON.stringify(data) }),
    update: (id: number, data: Omit<T, 'id'>) =>
      request<T>(`/${colecao}/${id}`, { method: 'PUT', body: JSON.stringify({ ...data, id }) }),
    remove: (id: number) => request<unknown>(`/${colecao}/${id}`, { method: 'DELETE' }),
  }
}
