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
      <ion-refresher slot="fixed" @ionRefresh="refresh($event)">
        <ion-refresher-content></ion-refresher-content>
      </ion-refresher>

      <div id="discovery">
        <ion-list>
          <ion-item
            v-for="service in state.services"
            @click="openModal(service)"
            :key="service.name"
          >
            <ion-label>
              <h3>
                {{ service.name }}@{{
                  service.host || service.ipv4Addresses[0]
                }}
                <ion-icon
                  v-if="
                    state.trustedFingerprints.includes(
                      service.txtRecord.fingerprint
                    )
                  "
                  class="shield-ok"
                  name="shield-checkmark"
                ></ion-icon>
                <ion-icon
                  v-if="
                    !state.trustedFingerprints.includes(
                      service.txtRecord.fingerprint
                    )
                  "
                  class="shield-yellow"
                  name="shield"
                ></ion-icon>
                <ion-icon
                  v-if="isConnected(service)"
                  name="checkmark-circle-outline"
                ></ion-icon>
                <ion-icon
                  v-if="hasConnectionError(service)"
                  name="alert-circle-outline"
                ></ion-icon>
              </h3>
              <p>TLS: {{ service.txtRecord.fingerprint }}</p>
              <p>
                <span
                  class="svc-address"
                  v-for="ip in service.ipv4Addresses"
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
  IonRefresher,
  IonRefresherContent,
  IonButtons,
  IonContent,
  IonHeader,
  IonMenuButton,
  IonPage,
  IonTitle,
  IonToolbar,
  IonLabel,
  IonItem,
  IonList,
  modalController,
  loadingController,
} from "@ionic/vue";
import {
  syncOutline,
  shieldCheckmark,
  shield,
  checkmarkCircleOutline,
  alertCircleOutline,
} from "ionicons/icons";
import { addIcons } from "ionicons";
import { reactive, watch } from "vue";
import Modal from "./ConnectModal.vue";
import {
  STATE_CONNECTED,
  state as socketState,
  STATE_DISCONNECTED,
  STATE_ERROR,
} from "@kickertech/common/socket";
import {
  state as zcState,
  triggerRefresh as zcTriggerRefresh,
} from "../lib/Zeroconf";
import { getFingerprints } from "../lib/SSLIntercept";

export default {
  name: "Discovery",
  components: {
    IonIcon,
    IonRefresher,
    IonRefresherContent,
    IonButtons,
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
      services: zcState.services,
      loading: zcState.loading,
      trustedFingerprints: [] as string[],
    });

    function updateFingerprints() {
      state.trustedFingerprints = getFingerprints();
    }
    updateFingerprints();

    async function refresh(event: any) {
      updateFingerprints();
      await zcTriggerRefresh();
      event.target.complete();
    }

    async function openModal(service: any) {
      const modal = await modalController.create({
        component: Modal,
        componentProps: {
          service: service,
        },
      });
      modal.onDidDismiss().then(() => {
        updateFingerprints();
      });
      return modal.present();
    }

    function isConnected(service: any) {
      const u = socketState.url;
      let matches = false;
      if (u) {
        matches = service.ipv4Addresses.find((addr: string) =>
          u.match(`wss://${addr}:${service.port}.*`)
        );
      }
      return matches && socketState.connectionState == STATE_CONNECTED;
    }

    function hasConnectionError(service: any) {
      const u = socketState.url;
      let matches = false;
      if (u) {
        matches = service.ipv4Addresses.find((addr: string) =>
          u.match(`wss://${addr}:${service.port}.*`)
        );
      }
      return (
        matches &&
        (socketState.connectionState == STATE_DISCONNECTED ||
          socketState.connectionState == STATE_ERROR)
      );
    }

    if (zcState.loading) {
      const showLoading = async () => {

        const loading = await loadingController.create({
          message: "Please wait...",
          duration: undefined,
        });
        const stop = watch(() => zcState.loading, () => {
          loading.dismiss()
          stop()
        })
        await loading.present();
      };
      showLoading();
    }

    addIcons({
      "sync-outline": syncOutline,
      "shield-checkmark": shieldCheckmark,
      "checkmark-circle-outline": checkmarkCircleOutline,
      "alert-circle-outline": alertCircleOutline,
      shield: shield,
    });

    return {
      state,
      socketState,
      refresh,
      syncOutline,
      openModal,
      isConnected,
      hasConnectionError,
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
.shield-ok {
  color: #0db34f;
}
.shield-yellow {
  color: #ffc409;
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
