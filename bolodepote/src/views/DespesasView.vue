<script setup lang="ts">
import { reactive, ref, watch } from 'vue'
import { mensagemErro } from '../api'
import { avisarErro, confirmar } from '../composables/useModal'
import { useDespesasStore } from '../stores/despesas'
import { usePeriodoStore } from '../stores/periodo'
import type { DespesaFixa } from '../types'
import { formatBRL, formatData } from '../utils/format'

const periodo = usePeriodoStore()
const despesas = useDespesasStore()

watch(() => periodo.mes, (mes) => despesas.carregar(mes), { immediate: true })
watch(() => despesas.erro, (e) => { if (e) avisarErro(e, 'Erro ao carregar despesas') })

const vazio = () => ({ nome: '', valorMensal: 0, dataReferencia: `${periodo.mes}-10` })
const form = reactive(vazio())
const editandoId = ref<number | null>(null)
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
}

async function salvar() {
  salvando.value = true
  try {
    await despesas.salvar({ ...form }, editandoId.value ?? undefined)
    cancelar()
  } catch (e) {
    avisarErro(mensagemErro(e), 'Não foi possível salvar a despesa')
  } finally {
    salvando.value = false
  }
}

async function remover(d: DespesaFixa) {
  const ok = await confirmar({
    titulo: 'Excluir despesa',
    mensagem: `Tem certeza que deseja excluir a despesa "${d.nome}" (${formatBRL(d.valorMensal)})? Essa ação não pode ser desfeita.`,
    textoConfirmar: 'Excluir',
  })
  if (!ok) return
  try {
    await despesas.remover(d.id)
    if (editandoId.value === d.id) cancelar()
  } catch (e) {
    avisarErro(mensagemErro(e), 'Não foi possível excluir a despesa')
  }
}
</script>

<template>
  <div class="grid">
    <form class="card sem-setas" @submit.prevent="salvar">
      <h2>{{ editandoId ? 'Editar despesa' : 'Lançar despesa fixa' }}</h2>
      <div class="campos">
        <div class="field">
          <label for="d-nome">Despesa</label>
          <input id="d-nome" v-model.trim="form.nome" required placeholder="Ex.: Energia elétrica" />
        </div>
        <div class="field">
          <label for="d-valor">Valor mensal (R$)</label>
          <input id="d-valor" v-model.number="form.valorMensal" type="number" inputmode="decimal" min="0" step="0.01" required />
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
    </form>

    <section class="card">
      <h2>Despesas de {{ periodo.rotulo }}</h2>
      <p v-if="!despesas.lista.length" class="empty">Nenhuma despesa lançada neste mês.</p>
      <div v-else class="table-wrap">
        <table class="tabela-responsiva">
          <thead>
            <tr><th>Despesa</th><th>Vencimento</th><th class="num">Valor</th><th><span class="sr-only">Ações</span></th></tr>
          </thead>
          <tbody>
            <tr v-for="d in despesas.lista" :key="d.id">
              <td class="td-titulo">{{ d.nome }}</td>
              <td class="muted" data-label="Vencimento">{{ formatData(d.dataReferencia) }}</td>
              <td class="num" data-label="Valor">{{ formatBRL(d.valorMensal) }}</td>
              <td class="num td-acoes">
                <div class="acoes-linha">
                  <button class="btn btn-link" @click="editar(d)">Editar</button>
                  <button class="btn btn-danger" @click="remover(d)">Excluir</button>
                </div>
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
