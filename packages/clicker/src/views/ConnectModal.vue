<template>
  <div>
    <ion-header translucent>
      <ion-toolbar>
        <ion-title>Connect</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="dismissModal()">Close</ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding" :fullscreen="true">
      <ion-list>
        <ion-item>
          <ion-label position="stacked">TLS fingerprint</ion-label>
          <p>{{ service.txtRecord.fingerprint }}</p>
        </ion-item>
        <ion-item>
          <ion-label>IP Address</ion-label>
          <ion-select v-model="state.selectedAddress" placeholder="Select One">
            <ion-select-option
              v-for="addr in service.ipv4Addresses"
              :key="addr"
              :value="addr"
              >{{ addr }}</ion-select-option
            >
          </ion-select>
        </ion-item>

        <ion-item>
          <ion-label position="stacked">Password</ion-label>
          <ion-input v-model="state.password"></ion-input>
        </ion-item>
      </ion-list>
      <ion-button @click="connect" expand="block">Connect</ion-button>
    </ion-content>
  </div>
</template>

<script>
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonSelect,
  IonSelectOption,
  IonToolbar,
  IonButtons,
  IonLabel,
  IonItem,
  IonButton,
  IonInput,
  IonList,
  modalController,
  toastController,
} from "@ionic/vue";
import { defineComponent, reactive } from "vue";
import { testConnection, state as websocketState } from "@kickertech/common/socket";
import { addFingerprint } from "../lib/SSLIntercept";

export default defineComponent({
  name: "Modal",
  props: {},
  setup(props, context) {
    const service = context.attrs.service;
    const state = reactive({
      password: "",
      selectedAddress: service.ipv4Addresses[0] || "",
    });

    function dismissModal() {
      modalController.dismiss();
    }

    async function connect() {
      console.log("connecting...");

      try {
        // approve SSL exception
        addFingerprint(service.txtRecord.fingerprint);
      } catch (e) {
        console.log(e);
      }

      const url = `wss://${state.selectedAddress}:${service.port}?server_password=${state.password}`;
      console.log(`testing url: ${url}`)
      try {
        await testConnection(url);
      } catch (e) {
        console.log(`error testing connection: ${e.message}`);
        toastController
          .create({
            message: `error testing connection: ${e}`,
            duration: 2000,
          })
          .then((t) => t.present());
        return;
      }

      toastController
        .create({
          message: "OK",
          duration: 2000,
        })
        .then((t) => t.present());

      websocketState.url = url
      modalController.dismiss();
    }

    return {
      dismissModal,
      service,
      connect,
      state,
    };
  },
  components: {
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonButtons,
    IonLabel,
    IonItem,
    IonInput,
    IonButton,
    IonList,
    IonSelectOption,
    IonSelect,
  },
  methods: {},
});
</script>
