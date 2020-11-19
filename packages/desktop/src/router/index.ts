import { createRouter, createWebHashHistory } from "@ionic/vue-router";
import { RouteRecordRaw } from "vue-router";
import Clicker from "@kickertech/common/views/Clicker.vue"
import Overlay from "../views/Overlay.vue";
import Discovery from "../views/Discovery.vue";
import Settings from "../views/Settings.vue";

const routes: Array<RouteRecordRaw> = [
  {
    path: "",
    redirect: "/overlay",
  },
  {
    path: "/clicker",
    component: Clicker,
  },
  {
    path: "/overlay",
    component: Overlay,
  },
  {
    path: "/discovery",
    component: Discovery,
  },
  {
    path: "/settings",
    component: Settings,
  },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

export default router;
