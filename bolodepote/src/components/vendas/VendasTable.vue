<script setup lang="ts">
import type { Venda } from '../../types'
import { formatBRL, formatData, formatNumero } from '../../utils/format'

defineProps<{
  vendas: Venda[]
  totalFaturado: number
  totalUnidades: number
  carregando?: boolean
}>()

const emit = defineEmits<{ remover: [venda: Venda] }>()

function confirmarRemocao(v: Venda) {
  if (confirm(`Excluir a venda de ${v.quantidade} × ${v.produtoNome} em ${formatData(v.data)}?`)) {
    emit('remover', v)
  }
}
</script>

<template>
  <section class="card">
    <h2>Vendas do mês</h2>

    <p v-if="carregando && !vendas.length" class="empty">Carregando…</p>
    <p v-else-if="!vendas.length" class="empty">Nenhuma venda registrada neste mês.</p>

    <div v-else class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Data</th>
            <th>Produto</th>
            <th class="num">Qtd.</th>
            <th class="num">Preço un.</th>
            <th class="num">Total</th>
            <th class="num">Margem</th>
            <th><span class="sr-only">Ações</span></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="v in vendas" :key="v.id">
            <td>{{ formatData(v.data) }}</td>
            <td>{{ v.produtoNome }}</td>
            <td class="num">{{ formatNumero(v.quantidade) }}</td>
            <td class="num muted">{{ formatBRL(v.precoUnitario) }}</td>
            <td class="num"><strong>{{ formatBRL(v.valorTotal) }}</strong></td>
            <td class="num positivo">{{ formatBRL((v.precoUnitario - v.custoUnitario) * v.quantidade) }}</td>
            <td class="num">
              <button class="btn btn-danger" :aria-label="`Excluir venda ${v.id}`" @click="confirmarRemocao(v)">
                Excluir
              </button>
            </td>
          </tr>
        </tbody>
        <tfoot>
          <tr>
            <td colspan="2">Total</td>
            <td class="num">{{ formatNumero(totalUnidades) }}</td>
            <td></td>
            <td class="num">{{ formatBRL(totalFaturado) }}</td>
            <td colspan="2"></td>
          </tr>
        </tfoot>
      </table>
    </div>
  </section>
</template>
