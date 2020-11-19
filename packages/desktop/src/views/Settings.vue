<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-menu-button></ion-menu-button>
        </ion-buttons>
        <ion-title>Settings</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true">
      <ion-header collapse="condense">
        <ion-toolbar>
          <ion-title size="large">Settings</ion-title>
        </ion-toolbar>
      </ion-header>

      <div id="settings">
        <ion-list>
          <ion-item>
            <ion-label position="stacked">Server Name</ion-label>
            <ion-input
              :debounce="1000"
              :placeholder="state.config.serverName ? '' : 'default'"
              v-model="state.config.serverName"
            ></ion-input>
          </ion-item>
          <ion-item>
            <ion-label position="stacked">Server Password</ion-label>
            <ion-input
              :debounce="1000"
              v-model="state.config.serverPassword"
            ></ion-input>
          </ion-item>
          <ion-item>
            <ion-label position="stacked">TLS Fingerprint</ion-label>
            <p class="fingerprint">{{ state.certFingerprint }}</p>
          </ion-item>
        </ion-list>
        <ion-button
          class="disconnect-btn"
          color="danger"
          @click="disconnectClients"
          expand=""
          >disconnect Clients</ion-button
        >
      </div>
    </ion-content>
  </ion-page>
</template>

<script lang="ts">
import {
  IonButtons,
  IonButton,
  IonContent,
  IonHeader,
  IonMenuButton,
  IonPage,
  IonTitle,
  IonList,
  IonItem,
  IonToolbar,
  IonInput,
  IonLabel,
} from "@ionic/vue";

import { ipcRenderer } from "electron";
import { reactive, watch, toRaw } from "vue";

export default {
  name: "Settings",
  components: {
    IonButtons,
    IonButton,
    IonContent,
    IonHeader,
    IonMenuButton,
    IonPage,
    IonTitle,
    IonToolbar,
    IonInput,
    IonItem,
    IonList,
    IonLabel,
  },
  setup() {
    const state = reactive({
      config: {
        serverName: "",
        serverPassword: "",
      },
      certFingerprint: "",
    }) as any;

    (async () => {
      const { config, fingerprint } = await ipcRenderer.invoke("settings:sync");
      Object.keys(config).forEach((key) => {
        state.config[key] = config[key];
      });
      state.certFingerprint = fingerprint;
    })();

    watch([() => state.config.serverName, () => state.config.serverPassword], () => {
      console.log(`invoking update`, state.config)
      ipcRenderer.invoke("settings:update", toRaw(state).config);
    });

    function disconnectClients() {
      ipcRenderer.send("settings:disconnectClients");
    }

    return {
      state,
      disconnectClients,
    };
  },
  methods: {},
};
</script>

<style scoped>
ion-menu-button {
  color: var(--ion-color-primary);
}

.fingerprint {
  color: #666;
}

.disconnect-btn {
  margin-left: 8px;
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
