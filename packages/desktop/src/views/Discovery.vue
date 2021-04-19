<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-menu-button></ion-menu-button>
        </ion-buttons>
        <ion-title>Discovery</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true">
      <ion-fab
        class="fab-button"
        vertical="top"
        edge="true"
        horizontal="end"
        slot="fixed"
      >
        <ion-fab-button @click="refresh">
          <ion-icon name="sync-outline"></ion-icon>
        </ion-fab-button>
      </ion-fab>

      <div id="discovery">
        <ion-list>
          <ion-item v-for="service in state.services" :key="service.name">
            <ion-label>
              <h3>{{ service.name }}@{{ service.host }}</h3>
              <p>TLS: {{ service.txt.fingerprint }}</p>
              <p>
                <span
                  class="svc-address"
                  v-for="ip in service.addresses"
                  :key="ip"
                  >{{ ip }}</span
                >
              </p>
            </ion-label>
          </ion-item>
        </ion-list>
      </div>
    </ion-content>
  </ion-page>
</template>

<script lang="ts">
import {
  IonIcon,
  IonFab,
  IonButtons,
  IonFabButton,
  IonContent,
  IonHeader,
  IonMenuButton,
  IonPage,
  IonTitle,
  IonToolbar,
  IonLabel,
  IonItem,
  IonList,
} from "@ionic/vue";
import { syncOutline } from "ionicons/icons";
import { addIcons } from "ionicons";

import { reactive, onUnmounted } from "vue";
import bonjour from "bonjour";

const svc = bonjour();

export default {
  name: "Discovery",
  components: {
    IonIcon,
    IonFab,
    IonButtons,
    IonFabButton,
    IonContent,
    IonHeader,
    IonMenuButton,
    IonPage,
    IonTitle,
    IonToolbar,
    IonLabel,
    IonItem,
    IonList,
  },
  data: function () {
    return {
      interval: null,
    };
  },
  setup() {
    const state = reactive({
      services: [] as bonjour.RemoteService[],
    });

    function notIPv6(addr: string) {
      const re = /(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))/;
      return !re.test(addr);
    }

    let browser = svc.find({ type: "fcl" }, (svc: any) => {
      console.log(svc);
      const services = state.services;
      services.push(svc);
      svc.addresses = svc.addresses.filter(notIPv6);
      state.services = [...services];
    });

    onUnmounted(() => {
      if (browser) {
        browser.stop();
      }
    });

    function refresh() {
      browser.stop();
      state.services = [];
      browser = svc.find({ type: "fcl" }, (svc: any) => {
        const services = state.services;
        services.push(svc);
        svc.addresses = svc.addresses.filter(notIPv6);
        state.services = [...services];
      });
    }

    addIcons({
      "sync-outline": syncOutline,
    });

    return {
      state,
      refresh,
      syncOutline,
    };
  },

  computed: {},
  methods: {},
};
</script>

<style scoped>
.svc-address {
  padding-right: 10px;
}
.fab-button {
  z-index: 100;
}
ion-menu-button {
  color: var(--ion-color-primary);
}

#container {
  text-align: center;
  position: absolute;
  left: 0;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
}

#container strong {
  font-size: 20px;
  line-height: 26px;
}

#container p {
  font-size: 16px;
  line-height: 22px;
  color: #8c8c8c;
  margin: 0;
}

#container a {
  text-decoration: none;
}
</style>
