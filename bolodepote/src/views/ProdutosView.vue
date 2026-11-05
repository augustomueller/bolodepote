<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { mensagemErro } from '../api'
import { useProdutosStore } from '../stores/produtos'
import type { Produto } from '../types'
import { formatBRL } from '../utils/format'

const produtos = useProdutosStore()
onMounted(() => produtos.carregar())

const vazio = () => ({ nome: '', precoVenda: 0, custoVariavel: 0, ativo: true })
const form = reactive(vazio())
const editandoId = ref<number | null>(null)
const erro = ref<string | null>(null)
const salvando = ref(false)

const margem = computed(() => (Math.round(form.precoVenda * 100) - Math.round(form.custoVariavel * 100)) / 100)
const margemPct = computed(() => (form.precoVenda > 0 ? Math.round((margem.value / form.precoVenda) * 100) : 0))

function editar(p: Produto) {
  editandoId.value = p.id
  Object.assign(form, { nome: p.nome, precoVenda: p.precoVenda, custoVariavel: p.custoVariavel, ativo: p.ativo })
  erro.value = null
}

function cancelar() {
  editandoId.value = null
  Object.assign(form, vazio())
  erro.value = null
}

async function salvar() {
  salvando.value = true
  erro.value = null
  try {
    await produtos.salvar({ ...form }, editandoId.value ?? undefined)
    cancelar()
  } catch (e) {
    erro.value = mensagemErro(e)
  } finally {
    salvando.value = false
  }
}

async function remover(p: Produto) {
  if (!confirm(`Excluir o produto "${p.nome}"?`)) return
  erro.value = null
  try {
    await produtos.remover(p.id)
  } catch (e) {
    erro.value = mensagemErro(e)
  }
}
</script>

<template>
  <div class="grid">
    <form class="card" @submit.prevent="salvar">
      <h2>{{ editandoId ? 'Editar produto' : 'Novo produto' }}</h2>
      <div class="campos">
        <div class="field">
          <label for="p-nome">Nome</label>
          <input id="p-nome" v-model.trim="form.nome" required placeholder="Ex.: Cupcake" />
        </div>
        <div class="field">
          <label for="p-preco">Preço de venda (R$)</label>
          <input id="p-preco" v-model.number="form.precoVenda" type="number" min="0.01" step="0.01" required />
        </div>
        <div class="field">
          <label for="p-custo">Custo variável (R$)</label>
          <input id="p-custo" v-model.number="form.custoVariavel" type="number" min="0" step="0.01" required />
        </div>
        <div class="field">
          <span class="label-fake">Margem bruta</span>
          <output :class="margem >= 0 ? 'positivo' : 'negativo'">
            {{ formatBRL(margem) }} <span class="muted small">({{ margemPct }}%)</span>
          </output>
        </div>
      </div>
      <div class="acoes">
        <label class="check"><input v-model="form.ativo" type="checkbox" /> Ativo para venda</label>
        <span class="espaco" />
        <button v-if="editandoId" type="button" class="btn btn-ghost" @click="cancelar">Cancelar</button>
        <button class="btn" type="submit" :disabled="salvando">{{ editandoId ? 'Salvar' : 'Cadastrar' }}</button>
      </div>
      <p v-if="erro || produtos.erro" class="alert alert-erro">{{ erro ?? produtos.erro }}</p>
    </form>

    <section class="card">
      <h2>Produtos</h2>
      <p v-if="!produtos.lista.length" class="empty">Nenhum produto cadastrado.</p>
      <div v-else class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Produto</th>
              <th class="num">Preço</th>
              <th class="num">Custo variável</th>
              <th class="num">Margem bruta</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="p in produtos.lista" :key="p.id">
              <td>{{ p.nome }} <span v-if="!p.ativo" class="badge">inativo</span></td>
              <td class="num">{{ formatBRL(p.precoVenda) }}</td>
              <td class="num muted">{{ formatBRL(p.custoVariavel) }}</td>
              <td class="num positivo">{{ formatBRL(p.margemBruta) }}</td>
              <td class="num">
                <button class="btn btn-link" @click="editar(p)">Editar</button>
                <button class="btn btn-danger" @click="remover(p)">Excluir</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </div>
</template>
