<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { mensagemErro } from '../api'
import { useProdutosStore } from '../stores/produtos'
import { useVendasStore } from '../stores/vendas'
import type { Venda } from '../types'
import { formatBRL, hojeISO } from '../utils/format'

const emit = defineEmits<{ registrada: [venda: Venda] }>()

const produtos = useProdutosStore()
const vendas = useVendasStore()

const form = reactive({
  data: hojeISO(),
  produtoId: null as number | null,
  quantidade: 1,
})
const enviando = ref(false)
const erro = ref<string | null>(null)
const sucesso = ref<string | null>(null)

// Pré-seleciona o produto quando só existe um (hoje: o Cupcake)
watch(
  () => produtos.ativos,
  (ativos) => {
    if (form.produtoId === null && ativos.length === 1) form.produtoId = ativos[0]!.id
  },
  { immediate: true },
)

const produto = computed(() => produtos.ativos.find((p) => p.id === form.produtoId))
const quantidadeValida = computed(() => Number.isInteger(form.quantidade) && form.quantidade > 0)

// Prévia apenas informativa: o valor oficial é calculado pela API
const previa = computed(() => {
  if (!produto.value || !quantidadeValida.value) return null
  const cents = (v: number) => Math.round(v * 100)
  const total = (cents(produto.value.precoVenda) * form.quantidade) / 100
  const margem = (cents(produto.value.margemBruta) * form.quantidade) / 100
  return { total, margem }
})

const podeEnviar = computed(() => !!form.data && !!produto.value && quantidadeValida.value && !enviando.value)

async function enviar() {
  if (!podeEnviar.value) return
  enviando.value = true
  erro.value = null
  sucesso.value = null
  try {
    const venda = await vendas.registrar({
      data: form.data,
      produtoId: form.produtoId!,
      quantidade: form.quantidade,
    })
    sucesso.value = `Venda registrada: ${venda.quantidade} × ${produto.value?.nome} = ${formatBRL(venda.valorTotal)}`
    form.quantidade = 1
    emit('registrada', venda)
  } catch (e) {
    erro.value = mensagemErro(e)
  } finally {
    enviando.value = false
  }
}
</script>

<template>
  <form class="card venda-form" @submit.prevent="enviar">
    <h2>Registrar venda</h2>

    <div class="campos">
      <div class="field">
        <label for="venda-data">Data</label>
        <input id="venda-data" v-model="form.data" type="date" required />
      </div>

      <div class="field produto">
        <label for="venda-produto">Produto</label>
        <select id="venda-produto" v-model="form.produtoId" required :disabled="!produtos.ativos.length">
          <option :value="null" disabled>
            {{ produtos.ativos.length ? 'Selecione…' : 'Nenhum produto cadastrado' }}
          </option>
          <option v-for="p in produtos.ativos" :key="p.id" :value="p.id">
            {{ p.nome }} — {{ formatBRL(p.precoVenda) }}
          </option>
        </select>
      </div>

      <div class="field">
        <label for="venda-qtd">Quantidade</label>
        <input id="venda-qtd" v-model.number="form.quantidade" type="number" min="1" step="1" required />
      </div>
    </div>

    <div class="rodape">
      <div class="previa" aria-live="polite">
        <template v-if="previa">
          <span class="muted small">Valor total</span>
          <strong>{{ formatBRL(previa.total) }}</strong>
          <span class="muted small">margem bruta {{ formatBRL(previa.margem) }}</span>
        </template>
      </div>
      <button class="btn" type="submit" :disabled="!podeEnviar">
        {{ enviando ? 'Salvando…' : 'Registrar venda' }}
      </button>
    </div>

    <p v-if="erro" class="alert alert-erro" role="alert">{{ erro }}</p>
    <p v-if="sucesso" class="alert alert-ok" role="status">{{ sucesso }}</p>
  </form>
</template>

<style scoped>
.venda-form { display: flex; flex-direction: column; gap: 16px; }
.venda-form h2 { margin: 0; }
.campos { display: grid; grid-template-columns: 160px 1fr 120px; gap: 12px; }
.rodape { display: flex; align-items: center; justify-content: space-between; gap: 16px; flex-wrap: wrap; }
.previa { display: flex; align-items: baseline; gap: 8px; flex-wrap: wrap; min-height: 32px; }
.previa strong { font-size: 1.4rem; }
.alert { margin: 0; }

@media (max-width: 640px) {
  .campos { grid-template-columns: 1fr 1fr; }
  .produto { grid-column: 1 / -1; order: -1; }
  .rodape .btn { width: 100%; }
}
</style>
