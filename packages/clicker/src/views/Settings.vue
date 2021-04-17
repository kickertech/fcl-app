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

    <ion-content :fullscreen="true" :class="{ scanning: state.scanning }">
      <ion-header collapse="condense">
        <ion-toolbar>
          <ion-title size="large">Settings</ion-title>
        </ion-toolbar>
      </ion-header>

      <div id="settings" ref="settings">
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
        </ion-list>
        <ion-button @click="scanQR" expand="block">Scan QRCode</ion-button>
      </div>
      <div id="cancel" ref="cancel" :class="{ scanning: state.scanning }">
        <ion-button  @click="cancelScan" expand="block">Cancel</ion-button>
      </div>
    </ion-content>
  </ion-page>
</template>

<script lang="ts">
import {
  toastController,
  IonButtons,
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

import { ref, reactive } from "vue";

import {
  testConnection,
  state as socketState,
} from "@kickertech/common/socket";
import { QRScanner } from "@ionic-native/qr-scanner";
import { addFingerprint } from "../lib/SSLIntercept";

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
    IonInput,
    IonItem,
    IonList,
    IonLabel,
  },
  setup() {
    const state = reactive({
      scanning: false,
    }) as any;

    const serverAddressChanged = (e: any) => {
      testConnection(e.detail.value)
        .then(async (result) => {
          socketState.url = e.detail.value;
          const toast = await toastController.create({
            message: "connected to server",
            duration: 2000,
          });
          return toast.present();
        })
        .catch(async (err) => {
          const toast = await toastController.create({
            message: `error testing server connection: ${err}`,
            duration: 2000,
          });
          return toast.present();
        });
    };

    const settings = ref(null);
    const cancel = ref(null);
    let scanSub: any;
    const scanQR = async () => {
      console.log("start qr scan")
      state.scanning = true
      let status = {} as any;
      try {
        status = await QRScanner.prepare();
      }catch(e) {
        console.log(e)
      }
      if (status.authorized) {
        (settings.value as any).style.transform = "translateX(-100%)";
        (cancel.value as any).style.transform = "translateX(0%)";
        QRScanner.show();
        scanSub = QRScanner.scan().subscribe(async (text: string) => {
          state.scanning = false
          QRScanner.hide();
          scanSub.unsubscribe();
          QRScanner.destroy();
          (settings.value as any).style.transform = "translateX(0%)";
          (cancel.value as any).style.transform = "translateX(100%)";

          const [ips, pass, fp] = text.split("|");
          const ipList = ips.split(";");
          try {
            addFingerprint(fp);
          } catch (e) {
            console.log(e);
            return;
          }

          let validURL = "";
          let errors = "";

          for (const ip of ipList) {
            const url = `wss://${ip}:9901?server_password=${pass}`;
            console.log(`testing url: ${url}`);
            try {
              await testConnection(url);
            } catch (e) {
              errors += `error testing connection: ${e.message}; `;
              console.log(`error testing connection: ${e.message}`);
              return;
            }
            validURL = url;
            break
          }

          if (validURL == "") {
            toastController
              .create({
                message: `could not connect: ${errors}`,
                duration: 2000,
              })
              .then((t) => t.present());
            return;
          }
          socketState.url = validURL;
          toastController
            .create({
              message: "Connected",
              duration: 2000,
            })
            .then((t) => t.present());
        });
      }
    };

    const cancelScan = () => {
      state.scanning = false
      if(scanSub) {
        scanSub.unsubscribe();
      }
      QRScanner.destroy();
      (settings.value as any).style.transform = "translateX(0%)";
    }

    return {
      serverAddressChanged,
      scanQR,
      cancelScan,
      settings,
      cancel,
      state,
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

#background-content{
  background: transparent;
}

#settings {
  transition: .3s ease-out;
}

#cancel {
  position: absolute;
  bottom: 0;
  left: 8px;
  right: 8px;
  height: 8vh;
  display: none;
  transition: .3s ease-out;
  transform: translateX(100%);
}

#cancel.scanning{
  display: block;
}
ion-content.scanning::part(background) {
    background: transparent;
}

</style>
