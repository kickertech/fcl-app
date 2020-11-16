import { createRouter, createWebHashHistory } from '@ionic/vue-router';
import Clicker from "@kickertech/common/views/Clicker.vue"
import Discovery from "../views/Discovery.vue";
import Settings from "../views/Settings.vue";
import { RouteRecordRaw } from 'vue-router';

const routes: Array<RouteRecordRaw> = [
  {
    path: '',
    redirect: '/clicker',
  },
  {
    path: '/clicker',
    component: Clicker
  },
  {
    path: '/discovery',
    component: Discovery
  },
  {
    path: '/settings',
    component: Settings
  },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
