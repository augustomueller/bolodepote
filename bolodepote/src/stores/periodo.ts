import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { deslocarMes, formatMes, mesAtual } from '../utils/format'


export const usePeriodoStore = defineStore('periodo', () => {
  const mes = ref(mesAtual())
  const rotulo = computed(() => formatMes(mes.value))
  const ehMesAtual = computed(() => mes.value === mesAtual())

  const anterior = () => (mes.value = deslocarMes(mes.value, -1))
  const proximo = () => (mes.value = deslocarMes(mes.value, 1))
  const irParaAtual = () => (mes.value = mesAtual())

  return { mes, rotulo, ehMesAtual, anterior, proximo, irParaAtual }
})
