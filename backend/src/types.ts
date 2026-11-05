// Entidades como estão gravadas no json-server (espelham database/schema.sql)

export interface Produto {
  id: number
  nome: string
  precoVenda: number
  custoVariavel: number
  ativo: boolean
}

/** Produto como a API devolve: com a margem bruta calculada. */
export interface ProdutoComMargem extends Produto {
  margemBruta: number
}

export interface DespesaFixa {
  id: number
  nome: string
  valorMensal: number
  /** YYYY-MM-DD — define o mês ao qual a despesa pertence */
  dataReferencia: string
}

export interface Venda {
  id: number
  /** YYYY-MM-DD */
  data: string
  produtoId: number
  quantidade: number
  /** Fotografia do preço no momento da venda */
  precoUnitario: number
  /** Fotografia do custo variável no momento da venda */
  custoUnitario: number
  valorTotal: number
}

export interface VendaDetalhada extends Venda {
  produtoNome: string
}

export interface PontoEquilibrioProduto {
  produtoId: number
  produtoNome: string
  margemUnitaria: number
  /** Unidades deste produto, vendendo só ele, para cobrir os custos fixos */
  unidades: number | null
}

export interface RelatorioMensal {
  /** YYYY-MM */
  mes: string
  faturamentoTotal: number
  custoVariavelTotal: number
  custoFixoTotal: number
  margemContribuicaoTotal: number
  lucroLiquido: number
  unidadesVendidas: number
  quantidadeVendas: number
  pontoEquilibrio: {
    /** Margem de contribuição média por unidade (ponderada pelo mix de vendas) */
    margemMediaUnitaria: number
    /** Unidades totais necessárias no mês para pagar os custos fixos */
    unidades: number | null
    /** Faturamento necessário para atingir o ponto de equilíbrio */
    faturamento: number | null
    /** Quanto do ponto de equilíbrio já foi atingido (0–1+) */
    progresso: number | null
    faltam: number | null
    porProduto: PontoEquilibrioProduto[]
  }
  vendasPorProduto: Array<{
    produtoId: number
    produtoNome: string
    quantidade: number
    faturamento: number
    custoVariavel: number
  }>
}
