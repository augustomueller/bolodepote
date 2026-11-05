import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { api, mensagemErro } from '../api'
import type { Produto, ProdutoInput } from '../types'

export const useProdutosStore = defineStore('produtos', () => {
  const lista = ref<Produto[]>([])
  const carregando = ref(false)
  const erro = ref<string | null>(null)

  const ativos = computed(() => lista.value.filter((p) => p.ativo))

  async function carregar() {
    carregando.value = true
    erro.value = null
    try {
      lista.value = await api.produtos.listar()
    } catch (e) {
      erro.value = mensagemErro(e)
    } finally {
      carregando.value = false
    }
  }

  async function salvar(dados: ProdutoInput, id?: number) {
    if (id) await api.produtos.atualizar(id, dados)
    else await api.produtos.criar(dados)
    await carregar()
  }

  async function remover(id: number) {
    await api.produtos.remover(id)
    lista.value = lista.value.filter((p) => p.id !== id)
  }

  return { lista, ativos, carregando, erro, carregar, salvar, remover }
})
