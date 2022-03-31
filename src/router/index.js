import { createRouter, createWebHistory } from 'vue-router'
import Main from '../views/Main.vue'
import Imprint from '../views/Imprint.vue'
import DataPolicy from '../views/DataPolicy.vue'

const routes = [
  {
    path: '/',
    name: 'Interaction Editor',
    component: Main
  },
  {
    path: '/imprint',
    name: 'Imprint',
    component: Imprint
  },
  {
    path: '/data',
    name: 'Data Policy',
    component: DataPolicy
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router
