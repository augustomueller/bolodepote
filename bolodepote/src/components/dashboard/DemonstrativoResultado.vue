<script setup lang="ts">
import type { RelatorioMensal } from '../types'
import { formatBRL } from '../utils/format'

defineProps<{ relatorio: RelatorioMensal }>()
</script>

<template>
  <section class="card">
    <h2>Como o lucro foi calculado</h2>
    <table>
      <tbody>
        <tr>
          <td>Faturamento total</td>
          <td class="num">{{ formatBRL(relatorio.faturamentoTotal) }}</td>
        </tr>
        <tr>
          <td class="muted">(−) Custo variável (ingredientes e embalagens)</td>
          <td class="num negativo">−{{ formatBRL(relatorio.custoVariavelTotal) }}</td>
        </tr>
        <tr class="subtotal">
          <td>= Margem de contribuição</td>
          <td class="num">{{ formatBRL(relatorio.margemContribuicaoTotal) }}</td>
        </tr>
        <tr>
          <td class="muted">(−) Custos fixos (internet, luz, água…)</td>
          <td class="num negativo">−{{ formatBRL(relatorio.custoFixoTotal) }}</td>
        </tr>
      </tbody>
      <tfoot>
        <tr>
          <td>= Lucro líquido</td>
          <td class="num" :class="relatorio.lucroLiquido >= 0 ? 'positivo' : 'negativo'">
            {{ formatBRL(relatorio.lucroLiquido) }}
          </td>
        </tr>
      </tfoot>
    </table>
  </section>
</template>

<style scoped>
.subtotal td { font-weight: 600; background: var(--surface-2); }
tfoot td { font-size: 1.05rem; }
</style>
