const brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })
const inteiro = new Intl.NumberFormat('pt-BR')

export const formatBRL = (v: number) => brl.format(v)
export const formatNumero = (v: number) => inteiro.format(v)

/** 2026-11-04 → 04/11/2026 (sem passar por Date, para não sofrer com fuso) */
export function formatData(iso: string): string {
  const [a, m, d] = iso.split('-')
  return `${d}/${m}/${a}`
}

const MESES = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro']


export function formatMes(mes: string): string {
  const [a, m] = mes.split('-')
  return `${MESES[Number(m) - 1]} de ${a}`
}

const pad = (n: number) => String(n).padStart(2, '0')

export function hojeISO(): string {
  const d = new Date()
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

export const mesAtual = () => hojeISO().slice(0, 7)

export function deslocarMes(mes: string, delta: number): string {
  const [a, m] = mes.split('-').map(Number)
  const d = new Date(a!, m! - 1 + delta, 1)
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}`
}
