<script setup lang="ts">
import { onMounted, watch } from 'vue'
import { mensagemErro } from '../api'
import VendaForm from '../components/vendas/VendaForm.vue'
import VendasTable from '../components/vendas/VendasTable.vue'
import { avisarErro } from '../composables/useModal'
import { usePeriodoStore } from '../stores/periodo'
import { useProdutosStore } from '../stores/produtos'
import { useVendasStore } from '../stores/vendas'
import type { Venda } from '../types'

const periodo = usePeriodoStore()
const produtos = useProdutosStore()
const vendas = useVendasStore()

onMounted(() => produtos.carregar())
watch(() => periodo.mes, (mes) => vendas.carregar(mes), { immediate: true })
watch(() => produtos.erro, (e) => { if (e) avisarErro(e, 'Erro ao carregar produtos') })
watch(() => vendas.erro, (e) => { if (e) avisarErro(e, 'Erro ao carregar vendas') })

/** Se a venda foi lançada em outro mês, leva a listagem até ele. */
function aoRegistrar(v: Venda) {
  const mesDaVenda = v.data.slice(0, 7)
  if (mesDaVenda !== periodo.mes) periodo.mes = mesDaVenda
}

async function remover(v: Venda) {
  try {
    await vendas.remover(v.id)
  } catch (e) {
    avisarErro(mensagemErro(e), 'Não foi possível excluir a venda')
  }
}
</script>

<template>
  <div class="grid">
    <VendaForm @registrada="aoRegistrar" />

    <VendasTable
      :vendas="vendas.lista"
      :total-faturado="vendas.totalFaturado"
      :total-unidades="vendas.totalUnidades"
      :carregando="vendas.carregando"
      @remover="remover"
    />
  </div>
</template>
