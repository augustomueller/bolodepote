<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { mensagemErro } from '../api'
import VendaForm from '../components/VendaForm.vue'
import VendasTable from '../components/VendasTable.vue'
import { usePeriodoStore } from '../stores/periodo'
import { useProdutosStore } from '../stores/produtos'
import { useVendasStore } from '../stores/vendas'
import type { Venda } from '../types'

const periodo = usePeriodoStore()
const produtos = useProdutosStore()
const vendas = useVendasStore()
const erroRemocao = ref<string | null>(null)

onMounted(() => produtos.carregar())
watch(() => periodo.mes, (mes) => vendas.carregar(mes), { immediate: true })

/** Se a venda foi lançada em outro mês, leva a listagem até ele. */
function aoRegistrar(v: Venda) {
  const mesDaVenda = v.data.slice(0, 7)
  if (mesDaVenda !== periodo.mes) periodo.mes = mesDaVenda
}

async function remover(v: Venda) {
  erroRemocao.value = null
  try {
    await vendas.remover(v.id)
  } catch (e) {
    erroRemocao.value = mensagemErro(e)
  }
}
</script>

<template>
  <div class="grid">
    <p v-if="produtos.erro" class="alert alert-erro">{{ produtos.erro }}</p>
    <VendaForm @registrada="aoRegistrar" />

    <p v-if="vendas.erro || erroRemocao" class="alert alert-erro">{{ vendas.erro ?? erroRemocao }}</p>
    <VendasTable
      :vendas="vendas.lista"
      :total-faturado="vendas.totalFaturado"
      :total-unidades="vendas.totalUnidades"
      :carregando="vendas.carregando"
      @remover="remover"
    />
  </div>
</template>
