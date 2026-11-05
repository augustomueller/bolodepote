// Contratos da API (espelham backend/src/types.ts)

export interface Produto {
  id: number
  nome: string
  precoVenda: number
  custoVariavel: number
  margemBruta: number
  ativo: boolean
}
export type ProdutoInput = Omit<Produto, 'id' | 'margemBruta'>

export interface DespesaFixa {
  id: number
  nome: string
  valorMensal: number
  dataReferencia: string
}
export type DespesaInput = Omit<DespesaFixa, 'id'>

export interface Venda {
  id: number
  data: string
  produtoId: number
  produtoNome: string
  quantidade: number
  precoUnitario: number
  custoUnitario: number
  valorTotal: number
}
export interface VendaInput {
  data: string
  produtoId: number
  quantidade: number
}

export interface RelatorioMensal {
  mes: string
  faturamentoTotal: number
  custoVariavelTotal: number
  custoFixoTotal: number
  margemContribuicaoTotal: number
  lucroLiquido: number
  unidadesVendidas: number
  quantidadeVendas: number
  pontoEquilibrio: {
    margemMediaUnitaria: number
    unidades: number | null
    faturamento: number | null
    progresso: number | null
    faltam: number | null
    porProduto: Array<{
      produtoId: number
      produtoNome: string
      margemUnitaria: number
      unidades: number | null
    }>
  }
  vendasPorProduto: Array<{
    produtoId: number
    produtoNome: string
    quantidade: number
    faturamento: number
    custoVariavel: number
  }>
}
