<script setup lang="ts">
import { reactive, ref, watch } from 'vue'
import { mensagemErro } from '../api'
import { useDespesasStore } from '../stores/despesas'
import { usePeriodoStore } from '../stores/periodo'
import type { DespesaFixa } from '../types'
import { formatBRL, formatData } from '../utils/format'

const periodo = usePeriodoStore()
const despesas = useDespesasStore()

watch(() => periodo.mes, (mes) => despesas.carregar(mes), { immediate: true })

const vazio = () => ({ nome: '', valorMensal: 0, dataReferencia: `${periodo.mes}-10` })
const form = reactive(vazio())
const editandoId = ref<number | null>(null)
const erro = ref<string | null>(null)
const salvando = ref(false)

// Ao trocar de mês, o formulário de nova despesa acompanha
watch(() => periodo.mes, () => { if (!editandoId.value) form.dataReferencia = `${periodo.mes}-10` })

function editar(d: DespesaFixa) {
  editandoId.value = d.id
  Object.assign(form, { nome: d.nome, valorMensal: d.valorMensal, dataReferencia: d.dataReferencia })
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
    await despesas.salvar({ ...form }, editandoId.value ?? undefined)
    cancelar()
  } catch (e) {
    erro.value = mensagemErro(e)
  } finally {
    salvando.value = false
  }
}

async function remover(d: DespesaFixa) {
  if (!confirm(`Excluir a despesa "${d.nome}"?`)) return
  try {
    await despesas.remover(d.id)
  } catch (e) {
    erro.value = mensagemErro(e)
  }
}
</script>

<template>
  <div class="grid">
    <form class="card" @submit.prevent="salvar">
      <h2>{{ editandoId ? 'Editar despesa' : 'Lançar despesa fixa' }}</h2>
      <div class="campos">
        <div class="field">
          <label for="d-nome">Despesa</label>
          <input id="d-nome" v-model.trim="form.nome" required placeholder="Ex.: Energia elétrica" />
        </div>
        <div class="field">
          <label for="d-valor">Valor mensal (R$)</label>
          <input id="d-valor" v-model.number="form.valorMensal" type="number" min="0" step="0.01" required />
        </div>
        <div class="field">
          <label for="d-data">Vencimento / referência</label>
          <input id="d-data" v-model="form.dataReferencia" type="date" required />
        </div>
      </div>
      <div class="acoes">
        <button v-if="editandoId" type="button" class="btn btn-ghost" @click="cancelar">Cancelar</button>
        <button class="btn" type="submit" :disabled="salvando">{{ editandoId ? 'Salvar' : 'Lançar' }}</button>
      </div>
      <p v-if="erro || despesas.erro" class="alert alert-erro">{{ erro ?? despesas.erro }}</p>
    </form>

    <section class="card">
      <h2>Despesas de {{ periodo.rotulo }}</h2>
      <p v-if="!despesas.lista.length" class="empty">Nenhuma despesa lançada neste mês.</p>
      <div v-else class="table-wrap">
        <table>
          <thead>
            <tr><th>Despesa</th><th>Vencimento</th><th class="num">Valor</th><th></th></tr>
          </thead>
          <tbody>
            <tr v-for="d in despesas.lista" :key="d.id">
              <td>{{ d.nome }}</td>
              <td class="muted">{{ formatData(d.dataReferencia) }}</td>
              <td class="num">{{ formatBRL(d.valorMensal) }}</td>
              <td class="num">
                <button class="btn btn-link" @click="editar(d)">Editar</button>
                <button class="btn btn-danger" @click="remover(d)">Excluir</button>
              </td>
            </tr>
          </tbody>
          <tfoot>
            <tr><td colspan="2">Total de custos fixos</td><td class="num">{{ formatBRL(despesas.total) }}</td><td></td></tr>
          </tfoot>
        </table>
      </div>
    </section>
  </div>
</template>

<style scoped>
form { display: flex; flex-direction: column; gap: 16px; }
form h2 { margin: 0; }
.campos { display: grid; grid-template-columns: 2fr 1fr 1fr; gap: 12px; }
.acoes { display: flex; justify-content: flex-end; gap: 8px; }
.alert { margin: 0; }
@media (max-width: 640px) { .campos { grid-template-columns: 1fr 1fr; } .campos > :first-child { grid-column: 1 / -1; } }
</style>
