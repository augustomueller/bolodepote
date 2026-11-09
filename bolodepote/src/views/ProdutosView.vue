<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { mensagemErro } from '../api'
import { avisarErro, confirmar } from '../composables/useModal'
import { useProdutosStore } from '../stores/produtos'
import type { Produto } from '../types'
import { formatBRL } from '../utils/format'

const produtos = useProdutosStore()
onMounted(() => produtos.carregar())
watch(() => produtos.erro, (e) => { if (e) avisarErro(e, 'Erro ao carregar produtos') })

const vazio = () => ({ nome: '', precoVenda: 0, custoVariavel: 0, ativo: true })
const form = reactive(vazio())
const editandoId = ref<number | null>(null)
const salvando = ref(false)

const margem = computed(() => (Math.round(form.precoVenda * 100) - Math.round(form.custoVariavel * 100)) / 100)
const margemPct = computed(() => (form.precoVenda > 0 ? Math.round((margem.value / form.precoVenda) * 100) : 0))

function editar(p: Produto) {
  editandoId.value = p.id
  Object.assign(form, { nome: p.nome, precoVenda: p.precoVenda, custoVariavel: p.custoVariavel, ativo: p.ativo })
}

function cancelar() {
  editandoId.value = null
  Object.assign(form, vazio())
}

async function salvar() {
  if (margem.value < 0) {
    const ok = await confirmar({
      titulo: 'Este produto vai dar prejuízo',
      mensagem:
        `O custo variável (${formatBRL(form.custoVariavel)}) é maior que o preço de venda (${formatBRL(form.precoVenda)}).\n` +
        `Cada unidade vendida gera um prejuízo de ${formatBRL(-margem.value)}.\n\nDeseja salvar mesmo assim?`,
      tom: 'aviso',
      textoConfirmar: 'Salvar mesmo assim',
    })
    if (!ok) return
  }

  salvando.value = true
  try {
    await produtos.salvar({ ...form }, editandoId.value ?? undefined)
    cancelar()
  } catch (e) {
    avisarErro(mensagemErro(e), 'Não foi possível salvar o produto')
  } finally {
    salvando.value = false
  }
}

async function remover(p: Produto) {
  const ok = await confirmar({
    titulo: 'Excluir produto',
    mensagem: `Tem certeza que deseja excluir o produto "${p.nome}"? Essa ação não pode ser desfeita.`,
    textoConfirmar: 'Excluir',
  })
  if (!ok) return
  try {
    await produtos.remover(p.id)
    if (editandoId.value === p.id) cancelar()
  } catch (e) {
    avisarErro(mensagemErro(e), 'Não foi possível excluir o produto')
  }
}
</script>

<template>
  <div class="grid">
    <form class="card sem-setas" @submit.prevent="salvar">
      <h2>{{ editandoId ? 'Editar produto' : 'Novo produto' }}</h2>
      <div class="campos">
        <div class="field">
          <label for="p-nome">Nome</label>
          <input id="p-nome" v-model.trim="form.nome" required placeholder="Ex.: Cupcake" />
        </div>
        <div class="field">
          <label for="p-preco">Preço de venda (R$)</label>
          <input id="p-preco" v-model.number="form.precoVenda" type="number" inputmode="decimal" min="0.01" step="0.01" required />
        </div>
        <div class="field">
          <label for="p-custo">Custo variável (R$)</label>
          <input id="p-custo" v-model.number="form.custoVariavel" type="number" inputmode="decimal" min="0" step="0.01" required />
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
    </form>

    <section class="card">
      <h2>Produtos</h2>
      <p v-if="!produtos.lista.length" class="empty">Nenhum produto cadastrado.</p>
      <div v-else class="table-wrap">
        <table class="tabela-responsiva">
          <thead>
            <tr>
              <th>Produto</th>
              <th class="num">Preço</th>
              <th class="num">Custo variável</th>
              <th class="num">Margem bruta</th>
              <th><span class="sr-only">Ações</span></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="p in produtos.lista" :key="p.id">
              <td class="td-titulo">{{ p.nome }} <span v-if="!p.ativo" class="badge">inativo</span></td>
              <td class="num" data-label="Preço">{{ formatBRL(p.precoVenda) }}</td>
              <td class="num muted" data-label="Custo variável">{{ formatBRL(p.custoVariavel) }}</td>
              <td class="num" data-label="Margem bruta" :class="p.margemBruta >= 0 ? 'positivo' : 'negativo'">{{ formatBRL(p.margemBruta) }}</td>
              <td class="num td-acoes">
                <div class="acoes-linha">
                  <button class="btn btn-link" @click="editar(p)">Editar</button>
                  <button class="btn btn-danger" @click="remover(p)">Excluir</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </div>
</template>
