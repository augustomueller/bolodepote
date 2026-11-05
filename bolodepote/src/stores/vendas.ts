import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { api, mensagemErro } from '../api'
import type { Venda, VendaInput } from '../types'

export const useVendasStore = defineStore('vendas', () => {
  const lista = ref<Venda[]>([])
  const carregando = ref(false)
  const erro = ref<string | null>(null)
  let mesCarregado = ''

  const totalFaturado = computed(
    () => lista.value.reduce((s, v) => s + Math.round(v.valorTotal * 100), 0) / 100,
  )
  const totalUnidades = computed(() => lista.value.reduce((s, v) => s + v.quantidade, 0))

  async function carregar(mes: string) {
    mesCarregado = mes
    carregando.value = true
    erro.value = null
    try {
      lista.value = await api.vendas.listar(mes)
    } catch (e) {
      erro.value = mensagemErro(e)
    } finally {
      carregando.value = false
    }
  }

  /** Registra a venda; o servidor define preço, custo e total a partir do produto. */
  async function registrar(dados: VendaInput): Promise<Venda> {
    const venda = await api.vendas.criar(dados)
    if (mesCarregado) await carregar(mesCarregado)
    return venda
  }

  async function remover(id: number) {
    await api.vendas.remover(id)
    lista.value = lista.value.filter((v) => v.id !== id)
  }

  return { lista, totalFaturado, totalUnidades, carregando, erro, carregar, registrar, remover }
})
