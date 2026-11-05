import type {
  DespesaFixa,
  PontoEquilibrioProduto,
  Produto,
  ProdutoComMargem,
  RelatorioMensal,
  Venda,
} from '../types.js'

// ---------------------------------------------------------------------------
// Dinheiro: todos os cálculos são feitos em CENTAVOS (inteiros) e convertidos
// para reais só na saída. Isso evita erros clássicos de ponto flutuante,
// como 0.1 + 0.2 = 0.30000000000000004.
// ---------------------------------------------------------------------------
export const toCents = (reais: number) => Math.round(reais * 100)
export const toReais = (cents: number) => Math.round(cents) / 100

export const MES_REGEX = /^\d{4}-(0[1-9]|1[0-2])$/

export function mesAtual(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

/** Datas são strings YYYY-MM-DD, então comparar o prefixo evita problemas de fuso horário. */
export const pertenceAoMes = (data: string, mes: string) => data.startsWith(`${mes}-`)

export function comMargem(p: Produto): ProdutoComMargem {
  return { ...p, margemBruta: toReais(toCents(p.precoVenda) - toCents(p.custoVariavel)) }
}

export function calcularValorTotal(precoUnitario: number, quantidade: number): number {
  return toReais(toCents(precoUnitario) * quantidade)
}

/** Divisão inteira arredondando para cima, sem passar por float. */
const ceilDiv = (a: number, b: number) => Math.floor((a + b - 1) / b)

export function gerarRelatorioMensal(
  mes: string,
  todasVendas: Venda[],
  todasDespesas: DespesaFixa[],
  produtos: Produto[],
): RelatorioMensal {
  const vendas = todasVendas.filter((v) => pertenceAoMes(v.data, mes))
  const despesas = todasDespesas.filter((d) => pertenceAoMes(d.dataReferencia, mes))
  const nomeProduto = new Map(produtos.map((p) => [p.id, p.nome]))

  let faturamentoC = 0
  let custoVariavelC = 0
  let unidades = 0
  const porProduto = new Map<number, { quantidade: number; faturamentoC: number; custoC: number }>()

  for (const v of vendas) {
    const fat = toCents(v.precoUnitario) * v.quantidade
    const custo = toCents(v.custoUnitario) * v.quantidade
    faturamentoC += fat
    custoVariavelC += custo
    unidades += v.quantidade

    const acc = porProduto.get(v.produtoId) ?? { quantidade: 0, faturamentoC: 0, custoC: 0 }
    acc.quantidade += v.quantidade
    acc.faturamentoC += fat
    acc.custoC += custo
    porProduto.set(v.produtoId, acc)
  }

  const custoFixoC = despesas.reduce((s, d) => s + toCents(d.valorMensal), 0)
  const margemTotalC = faturamentoC - custoVariavelC
  const lucroC = margemTotalC - custoFixoC

  // -------------------------------------------------------------------------
  // Ponto de equilíbrio (em unidades) = Custo Fixo / Margem de contribuição unitária
  //
  // Com vários produtos, usamos a margem MÉDIA ponderada pelo mix de vendas do
  // mês. Se ainda não houve vendas, usamos a média simples dos produtos ativos.
  // Ex.: 440,00 / (8,00 - 4,50) = 125,7 → 126 cupcakes.
  // -------------------------------------------------------------------------
  const ativos = produtos.filter((p) => p.ativo)
  let margemSomaC: number
  let margemPeso: number
  let precoSomaC: number
  if (unidades > 0) {
    margemSomaC = margemTotalC
    precoSomaC = faturamentoC
    margemPeso = unidades
  } else {
    margemSomaC = ativos.reduce((s, p) => s + toCents(p.precoVenda) - toCents(p.custoVariavel), 0)
    precoSomaC = ativos.reduce((s, p) => s + toCents(p.precoVenda), 0)
    margemPeso = ativos.length
  }

  const temMargem = margemPeso > 0 && margemSomaC > 0
  const unidadesPE = !temMargem ? null : custoFixoC === 0 ? 0 : ceilDiv(custoFixoC * margemPeso, margemSomaC)
  // Faturamento necessário = Custo Fixo / índice de margem de contribuição
  const faturamentoPE = !temMargem ? null : toReais((custoFixoC * precoSomaC) / margemSomaC)

  const porProdutoPE: PontoEquilibrioProduto[] = ativos.map((p) => {
    const margemC = toCents(p.precoVenda) - toCents(p.custoVariavel)
    return {
      produtoId: p.id,
      produtoNome: p.nome,
      margemUnitaria: toReais(margemC),
      unidades: margemC > 0 ? ceilDiv(custoFixoC, margemC) : null,
    }
  })

  return {
    mes,
    faturamentoTotal: toReais(faturamentoC),
    custoVariavelTotal: toReais(custoVariavelC),
    custoFixoTotal: toReais(custoFixoC),
    margemContribuicaoTotal: toReais(margemTotalC),
    lucroLiquido: toReais(lucroC),
    unidadesVendidas: unidades,
    quantidadeVendas: vendas.length,
    pontoEquilibrio: {
      margemMediaUnitaria: margemPeso > 0 ? toReais(margemSomaC / margemPeso) : 0,
      unidades: unidadesPE,
      faturamento: faturamentoPE,
      progresso: unidadesPE === null ? null : unidadesPE === 0 ? 1 : unidades / unidadesPE,
      faltam: unidadesPE === null ? null : Math.max(0, unidadesPE - unidades),
      porProduto: porProdutoPE,
    },
    vendasPorProduto: [...porProduto.entries()].map(([produtoId, acc]) => ({
      produtoId,
      produtoNome: nomeProduto.get(produtoId) ?? `Produto #${produtoId}`,
      quantidade: acc.quantidade,
      faturamento: toReais(acc.faturamentoC),
      custoVariavel: toReais(acc.custoC),
    })),
  }
}
