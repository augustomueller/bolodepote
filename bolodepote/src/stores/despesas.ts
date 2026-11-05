import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { api, mensagemErro } from '../api'
import type { DespesaFixa, DespesaInput } from '../types'

export const useDespesasStore = defineStore('despesas', () => {
  const lista = ref<DespesaFixa[]>([])
  const carregando = ref(false)
  const erro = ref<string | null>(null)
  let mesCarregado = ''

  const total = computed(() => lista.value.reduce((s, d) => s + Math.round(d.valorMensal * 100), 0) / 100)

  async function carregar(mes: string) {
    mesCarregado = mes
    carregando.value = true
    erro.value = null
    try {
      lista.value = await api.despesas.listar(mes)
    } catch (e) {
      erro.value = mensagemErro(e)
    } finally {
      carregando.value = false
    }
  }

  async function salvar(dados: DespesaInput, id?: number) {
    if (id) await api.despesas.atualizar(id, dados)
    else await api.despesas.criar(dados)
    await carregar(mesCarregado)
  }

  async function remover(id: number) {
    await api.despesas.remover(id)
    lista.value = lista.value.filter((d) => d.id !== id)
  }

  return { lista, total, carregando, erro, carregar, salvar, remover }
})
