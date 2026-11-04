<script setup lang="ts">
withDefaults(
  defineProps<{
    titulo: string
    valor: string
    detalhe?: string
    tom?: 'neutro' | 'positivo' | 'negativo' | 'destaque'
  }>(),
  { tom: 'neutro' },
)
</script>

<template>
  <article class="card kpi" :class="`kpi-${tom}`">
    <p class="titulo">{{ titulo }}</p>
    <p class="valor">{{ valor }}</p>
    <p v-if="detalhe" class="detalhe">{{ detalhe }}</p>
  </article>
</template>

<style scoped>
.kpi { display: flex; flex-direction: column; gap: 4px; padding: 18px 20px; }
.titulo { margin: 0; font-size: 0.85rem; font-weight: 600; color: var(--text-muted); }
.valor { margin: 0; font-size: 1.6rem; font-weight: 700; letter-spacing: -0.01em; }
.detalhe { margin: 0; font-size: 0.82rem; color: var(--text-muted); }

.kpi-destaque { border-color: var(--brand); }
.kpi-positivo { background: var(--positive-soft); border-color: transparent; }
.kpi-positivo .valor { color: var(--positive); }
.kpi-negativo { background: var(--negative-soft); border-color: transparent; }
.kpi-negativo .valor { color: var(--negative); }
</style>
