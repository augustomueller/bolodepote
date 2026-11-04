<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import MonthPicker from './components/MonthPicker.vue'

const route = useRoute()
const titulo = computed(() => (route.meta.titulo as string | undefined) ?? '')
const usaMes = computed(() => route.name !== 'produtos')

const links = [
  { to: '/', label: 'Dashboard' },
  { to: '/vendas', label: 'Vendas' },
  { to: '/produtos', label: 'Produtos' },
  { to: '/despesas', label: 'Despesas' },
]
</script>

<template>
  <header class="topo">
    <div class="topo-inner">
      <span class="marca">🧁 Confeitaria da Maria</span>
      <nav>
        <RouterLink v-for="l in links" :key="l.to" :to="l.to" class="link">{{ l.label }}</RouterLink>
      </nav>
    </div>
  </header>

  <main class="container">
    <div class="cabecalho">
      <h1>{{ titulo }}</h1>
      <MonthPicker v-if="usaMes" />
    </div>
    <RouterView />
  </main>
</template>

<style scoped>
.topo { background: var(--surface); border-bottom: 1px solid var(--border); position: sticky; top: 0; z-index: 10; }
.topo-inner { max-width: 1120px; margin: 0 auto; padding: 0 16px; display: flex; align-items: center; gap: 24px; min-height: 60px; flex-wrap: wrap; }
.marca { font-weight: 700; font-size: 1.05rem; }
nav { display: flex; gap: 4px; overflow-x: auto; }
.link { padding: 8px 12px; border-radius: 8px; color: var(--text-muted); text-decoration: none; font-weight: 600; font-size: 0.92rem; white-space: nowrap; }
.link:hover { color: var(--text); background: var(--surface-2); }
.link.router-link-exact-active { color: var(--brand); background: var(--brand-soft); }
.cabecalho { display: flex; align-items: center; justify-content: space-between; gap: 16px; flex-wrap: wrap; margin-bottom: 20px; }
</style>
