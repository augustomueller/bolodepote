<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import MonthPicker from './components/comum/MonthPicker.vue'

const route = useRoute()
const titulo = computed(() => String(route.meta.titulo ?? ''))
const mostrarMes = computed(() => route.name !== 'produtos')

const links = [
  { to: '/', label: 'Dashboard' },
  { to: '/vendas', label: 'Vendas' },
  { to: '/produtos', label: 'Produtos' },
  { to: '/despesas', label: 'Despesas' },
]
</script>

<template>
  <header class="topo">
    <div class="topo-conteudo">
      <RouterLink to="/" class="marca"><span aria-hidden="true">🧁</span> Confeitaria da Maria</RouterLink>

      <nav aria-label="Menu principal">
        <ul>
          <li v-for="link in links" :key="link.to">
            <RouterLink :to="link.to">{{ link.label }}</RouterLink>
          </li>
        </ul>
      </nav>
    </div>
  </header>

  <main class="container">
    <header class="cabecalho">
      <h1>{{ titulo }}</h1>
      <MonthPicker v-if="mostrarMes" />
    </header>

    <RouterView />
  </main>
</template>

<style scoped>
.topo {
  position: sticky;
  top: 0;
  z-index: 10;
  background: var(--surface);
  border-bottom: 1px solid var(--border);
}

.topo-conteudo {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 24px;
  max-width: 1120px;
  min-height: 60px;
  margin: 0 auto;
  padding: 0 16px;
}

.marca {
  font-weight: 700;
  font-size: 1.05rem;
  color: inherit;
  text-decoration: none;
}

nav ul {
  display: flex;
  gap: 4px;
  margin: 0;
  padding: 0;
  list-style: none;
  overflow-x: auto;
}

nav a {
  display: block;
  padding: 8px 12px;
  border-radius: 8px;
  color: var(--text-muted);
  font-weight: 600;
  font-size: 0.92rem;
  text-decoration: none;
  white-space: nowrap;
}

nav a:hover {
  color: var(--text);
  background: var(--surface-2);
}

nav a.router-link-exact-active {
  color: var(--brand);
  background: var(--brand-soft);
}

.cabecalho {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 20px;
}
</style>
