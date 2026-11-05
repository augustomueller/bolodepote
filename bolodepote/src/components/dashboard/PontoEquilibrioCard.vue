<script setup lang="ts">
import { computed } from 'vue'
import type { RelatorioMensal } from '../../types'
import { formatBRL, formatNumero } from '../../utils/format'

const props = defineProps<{ relatorio: RelatorioMensal }>()

const pe = computed(() => props.relatorio.pontoEquilibrio)
const atingido = computed(() => pe.value.faltam === 0)
const percentual = computed(() => Math.min(100, Math.round((pe.value.progresso ?? 0) * 100)))
const umProduto = computed(() => pe.value.porProduto.length === 1)
const nomeUnidade = computed(() =>
  umProduto.value ? `unidades de ${pe.value.porProduto[0]!.produtoNome}` : 'unidades',
)
</script>

<template>
  <section class="card">
    <h2>Ponto de equilíbrio</h2>

    <p v-if="pe.unidades === null" class="muted">
      Cadastre um produto com margem positiva para calcular o ponto de equilíbrio.
    </p>

    <template v-else>
      <p class="meta">
        <strong>{{ formatNumero(pe.unidades) }}</strong> {{ nomeUnidade }}/mês
      </p>
      <p class="muted small">
        para cobrir {{ formatBRL(relatorio.custoFixoTotal) }} de custos fixos
        (margem de {{ formatBRL(pe.margemMediaUnitaria) }} por unidade
        <template v-if="pe.faturamento !== null"> · faturamento de {{ formatBRL(pe.faturamento) }}</template>)
      </p>

      <progress :value="percentual" max="100" :aria-label="`${percentual}% do ponto de equilíbrio`">
        {{ percentual }}%
      </progress>

      <p class="status" :class="atingido ? 'positivo' : ''">
        <template v-if="atingido">
          Meta atingida: {{ formatNumero(relatorio.unidadesVendidas) }} vendidos. Cada unidade extra agora é lucro.
        </template>
        <template v-else>
          {{ formatNumero(relatorio.unidadesVendidas) }} vendidos · faltam
          <strong>{{ formatNumero(pe.faltam ?? 0) }}</strong> para pagar os custos fixos
        </template>
      </p>

      <details v-if="!umProduto && pe.porProduto.length" class="small">
        <summary class="muted">Se vendesse só um produto</summary>
        <ul>
          <li v-for="p in pe.porProduto" :key="p.produtoId">
            {{ p.produtoNome }}: {{ p.unidades === null ? 'sem margem' : `${formatNumero(p.unidades)} unidades` }}
          </li>
        </ul>
      </details>
    </template>
  </section>
</template>
