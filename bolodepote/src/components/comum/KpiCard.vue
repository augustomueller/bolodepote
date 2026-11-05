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
