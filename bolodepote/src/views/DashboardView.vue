<script setup lang="ts">
import { computed, watch } from 'vue'
import DemonstrativoResultado from '../components/DemonstrativoResultado.vue'
import KpiCard from '../components/KpiCard.vue'
import PontoEquilibrioCard from '../components/PontoEquilibrioCard.vue'
import { usePeriodoStore } from '../stores/periodo'
import { useRelatorioStore } from '../stores/relatorio'
import { formatBRL, formatNumero } from '../utils/format'

const periodo = usePeriodoStore()
const relatorio = useRelatorioStore()

watch(() => periodo.mes, (mes) => relatorio.carregar(mes), { immediate: true })

const r = computed(() => relatorio.dados)
const lucroPositivo = computed(() => (r.value?.lucroLiquido ?? 0) >= 0)
</script>

<template>
  <div class="grid">
    <p v-if="relatorio.erro" class="alert alert-erro">{{ relatorio.erro }}</p>
    <p v-else-if="!r" class="empty">Carregando relatório…</p>

    <template v-if="r">
      <div class="kpis" :class="{ atualizando: relatorio.carregando }">
        <KpiCard
          titulo="Faturamento"
          :valor="formatBRL(r.faturamentoTotal)"
          :detalhe="`${formatNumero(r.unidadesVendidas)} unidades em ${r.quantidadeVendas} vendas`"
        />
        <KpiCard
          titulo="Custo variável"
          :valor="formatBRL(r.custoVariavelTotal)"
          detalhe="ingredientes e embalagens"
        />
        <KpiCard titulo="Custos fixos" :valor="formatBRL(r.custoFixoTotal)" detalhe="despesas do mês" />
        <KpiCard
          titulo="Lucro líquido"
          :valor="formatBRL(r.lucroLiquido)"
          :tom="lucroPositivo ? 'positivo' : 'negativo'"
          :detalhe="lucroPositivo ? 'o que sobrou de verdade' : 'prejuízo no mês'"
        />
      </div>

      <div class="duas-colunas">
        <PontoEquilibrioCard :relatorio="r" />
        <DemonstrativoResultado :relatorio="r" />
      </div>

      <section v-if="r.vendasPorProduto.length" class="card">
        <h2>Vendas por produto</h2>
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Produto</th>
                <th class="num">Unidades</th>
                <th class="num">Faturamento</th>
                <th class="num">Custo variável</th>
                <th class="num">Margem</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="p in r.vendasPorProduto" :key="p.produtoId">
                <td>{{ p.produtoNome }}</td>
                <td class="num">{{ formatNumero(p.quantidade) }}</td>
                <td class="num">{{ formatBRL(p.faturamento) }}</td>
                <td class="num muted">{{ formatBRL(p.custoVariavel) }}</td>
                <td class="num positivo">{{ formatBRL(p.faturamento - p.custoVariavel) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </template>
  </div>
</template>

<style scoped>
.kpis { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; transition: opacity 0.2s; }
.kpis.atualizando { opacity: 0.6; }
.duas-colunas { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; align-items: start; }

@media (max-width: 900px) {
  .kpis { grid-template-columns: repeat(2, 1fr); }
  .duas-colunas { grid-template-columns: 1fr; }
}
@media (max-width: 480px) {
  .kpis { grid-template-columns: 1fr; }
}
</style>
