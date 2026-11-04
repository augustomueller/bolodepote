<script setup lang="ts">
import { usePeriodoStore } from '../../stores/periodo'

const periodo = usePeriodoStore()
</script>

<template>
  <div class="month-picker">
    <button class="btn btn-ghost nav" aria-label="Mês anterior" @click="periodo.anterior">‹</button>
    <span class="label">{{ periodo.rotulo }}</span>
    <button class="btn btn-ghost nav" aria-label="Próximo mês" @click="periodo.proximo">›</button>
    <button v-if="!periodo.ehMesAtual" class="btn btn-link small" @click="periodo.irParaAtual">Hoje</button>
  </div>
</template>

<style scoped>
.month-picker { display: flex; align-items: center; gap: 6px; }
.nav { padding: 0; width: 36px; min-height: 36px; font-size: 1.2rem; line-height: 1; }
.label { min-width: 150px; text-align: center; font-weight: 600; text-transform: capitalize; }
</style>
