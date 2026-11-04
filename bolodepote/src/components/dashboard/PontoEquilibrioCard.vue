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

      <div
        class="progress"
        role="progressbar"
        :aria-valuenow="percentual"
        aria-valuemin="0"
        aria-valuemax="100"
        :aria-label="`${percentual}% do ponto de equilíbrio`"
      >
        <div class="bar" :class="{ ok: atingido }" :style="{ width: `${percentual}%` }" />
      </div>

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

<style scoped>
.meta { margin: 0; font-size: 1.1rem; }
.meta strong { font-size: 2rem; color: var(--brand); }
.progress { margin: 16px 0 8px; height: 10px; border-radius: 999px; background: var(--surface-2); overflow: hidden; }
.bar { height: 100%; background: var(--brand); border-radius: 999px; transition: width 0.4s ease; }
.bar.ok { background: var(--positive); }
.status { margin: 0 0 8px; font-size: 0.92rem; }
ul { margin: 8px 0 0; padding-left: 20px; }
</style>
