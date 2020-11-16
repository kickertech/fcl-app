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
        <!-- List of Input Items -->
        <ion-list>
          <ion-item>
            <ion-label position="stacked">Server Address</ion-label>
            <ion-input
              debounce="1000"
              type="url"
              :placeholder="serverAddress ? '' : 'ws://example.com'"
              @ionChange="serverAddressChanged"
              v-model="serverAddress"
            ></ion-input>
          </ion-item>
          <ion-item>
            <ion-label>Toggle</ion-label>
            <ion-toggle slot="end"></ion-toggle>
          </ion-item>
          <ion-item>
            <ion-label>Radio</ion-label>
            <ion-radio slot="end"></ion-radio>
          </ion-item>
          <ion-item>
            <ion-label>Update Interval</ion-label>
            <ion-range
              min="3"
              max="15"
              step="1"
              snaps="true"
              ticks="true"
              color="danger"
              pin="true"
            ></ion-range>
          </ion-item>
          <ion-item>
            <ion-label>Checkbox</ion-label>
            <ion-checkbox slot="start"></ion-checkbox>
          </ion-item>
        </ion-list>
      </div>
    </ion-content>
  </ion-page>
</template>

<script lang="ts">
import {
  toastController,
  IonRange,
  IonButtons,
  IonContent,
  IonHeader,
  IonMenuButton,
  IonPage,
  IonTitle,
  IonList,
  IonItem,
  IonToolbar,
  IonCheckbox,
  IonInput,
  IonLabel,
  IonRadio,
  IonToggle,
} from "@ionic/vue";

import { testConnection, state as socketState } from "@kickertech/common/socket";

export default {
  name: "Settings",
  components: {
    IonButtons,
    IonContent,
    IonHeader,
    IonMenuButton,
    IonPage,
    IonTitle,
    IonToolbar,
    IonCheckbox,
    IonInput,
    IonItem,
    IonList,
    IonLabel,
    IonRadio,
    IonToggle,
    IonRange,
  },
  setup() {
    const serverAddressChanged = (e: any) => {
      testConnection(e.detail.value)
        .then(async (result) => {
          console.log("done testing", result);

          socketState.url = e.detail.value;
          const toast = await toastController.create({
            message: "connected to server",
            duration: 2000,
          });
          return toast.present();
        })
        .catch(async (err) => {
          console.log("err testing", err);
          const toast = await toastController.create({
            message: `error testing server connection: ${err}`,
            duration: 2000,
          });
          return toast.present();
        });
    };

    return {
      serverAddressChanged,
      serverAddress: socketState.url,
    };
  },
  methods: {},
};
</script>

<style scoped>
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
