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
      <RouterLink to="/" class="marca"><span aria-hidden="true" >🧁</span> Confeitaria da Maria</RouterLink>

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
