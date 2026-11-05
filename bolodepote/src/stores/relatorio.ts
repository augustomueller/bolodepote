import { defineStore } from 'pinia'
import { ref } from 'vue'
import { api, mensagemErro } from '../api'
import type { RelatorioMensal } from '../types'

export const useRelatorioStore = defineStore('relatorio', () => {
  const dados = ref<RelatorioMensal | null>(null)
  const carregando = ref(false)
  const erro = ref<string | null>(null)

  async function carregar(mes: string) {
    carregando.value = true
    erro.value = null
    try {
      dados.value = await api.relatorios.mensal(mes)
    } catch (e) {
      erro.value = mensagemErro(e)
    } finally {
      carregando.value = false
    }
  }

  return { dados, carregando, erro, carregar }
})
