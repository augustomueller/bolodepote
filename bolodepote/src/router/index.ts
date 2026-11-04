import { createRouter, createWebHistory } from 'vue-router'
import DashboardView from '../views/DashboardView.vue'

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'dashboard', component: DashboardView, meta: { titulo: 'Dashboard' } },
    { path: '/vendas', name: 'vendas', component: () => import('../views/VendasView.vue'), meta: { titulo: 'Vendas' } },
    { path: '/produtos', name: 'produtos', component: () => import('../views/ProdutosView.vue'), meta: { titulo: 'Produtos' } },
    { path: '/despesas', name: 'despesas', component: () => import('../views/DespesasView.vue'), meta: { titulo: 'Despesas fixas' } },
    { path: '/:pathMatch(.*)*', redirect: '/' },
  ],
})
