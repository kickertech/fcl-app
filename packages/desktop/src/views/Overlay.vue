<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-menu-button></ion-menu-button>
        </ion-buttons>
        <div class="select-wrapper">
          <ion-title>Overlay</ion-title>
          <ion-select
            class="namespace-selector"
            :value="state.selectedNamespace"
            placeholder="Select Namespace"
          >
            <ion-select-option
              v-for="namespace in state.incomingEvents.getNamespaces()"
              :key="namespace"
              :value="namespace"
              @click="state.selectedNamespace = namespace"
              >{{ namespace }}</ion-select-option
            >
          </ion-select>
        </div>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true">
      <ion-header collapse="condense">
        <ion-toolbar>
          <ion-title size="large">Overlay</ion-title>
        </ion-toolbar>
      </ion-header>

      <div id="overlay-controls">
        <ion-grid>
          <ion-row>
            <ion-col>
              <ion-item>
                <ion-label position="stacked">Left Team</ion-label>
                <ion-input v-model="state.leftName"></ion-input>
              </ion-item>
            </ion-col>
            <ion-col>
              <ion-item>
                <ion-label position="stacked">Right Team</ion-label>
                <ion-input v-model="state.rightName"></ion-input>
              </ion-item>
            </ion-col>
          </ion-row>
          <ion-row>
            <ion-col>
              <ion-button color="danger" @click="resetClicker()"
                >RESET CLICKER</ion-button
              >
              <ion-button>Do FOO</ion-button>
            </ion-col>
          </ion-row>
        </ion-grid>
        <ion-grid>
          <ion-row>
            <div id="logs">
              <h3>EVENTS</h3>
              <div
                v-for="(set, i) in state.incomingEvents.getSets(
                  state.selectedNamespace
                )"
                :key="i"
                class="set"
              >
                <h3>Set {{ i + 1 }}</h3>
                <ul>
                  <li v-for="(event, j) in set.events" :key="j">
                    {{ event.toString() }}
                  </li>
                </ul>
              </div>
            </div>
          </ion-row>
        </ion-grid>
      </div>
    </ion-content>
  </ion-page>
</template>

<script lang="ts">
import {
  IonButtons,
  IonGrid,
  IonItem,
  IonInput,
  IonLabel,
  IonRow,
  IonCol,
  IonSelect,
  IonSelectOption,
  IonContent,
  IonHeader,
  IonMenuButton,
  IonButton,
  IonPage,
  IonTitle,
  IonToolbar,
} from "@ionic/vue";

import { reactive, onUnmounted, watch } from "vue";
import { Set } from "@kickertech/common/game/Set";
import {
  TYPE_L_GOAL,
  TYPE_R_GOAL,
  GameEvent,
  getEventName,
} from "@kickertech/common/game/GameEvents";
import { EventStore } from "@kickertech/common/store/EventStore";
import { ipcRenderer } from "electron";
import {
  EVENT_NEW_SET,
  EVENT_RESET,
  EVENT_UNDO,
} from "@kickertech/common/game/ControlEvents";

export default {
  name: "Overlay",
  components: {
    IonSelect,
    IonInput,
    IonLabel,
    IonGrid,
    IonItem,
    IonRow,
    IonCol,
    IonSelectOption,
    IonButtons,
    IonButton,
    IonContent,
    IonHeader,
    IonMenuButton,
    IonPage,
    IonTitle,
    IonToolbar,
  },
  setup() {
    const state = reactive({
      selectedNamespace: "default",
      leftName: "",
      rightName: "",
      connectedClients: 0,
      incomingEvents: new EventStore({
        default: {
          resourceVersion: 0,
          leftName: "",
          rightName: "",
          sets: [new Set()],
        },
      }),
    });

    watch([() => state.leftName, () => state.rightName], () => {
      state.incomingEvents.setLeftName(state.selectedNamespace, state.leftName);
      state.incomingEvents.setRightName(
        state.selectedNamespace,
        state.rightName
      );
      ipcRenderer.invoke("overlay:game:update", {
        namespace: state.selectedNamespace,
        data: {
          leftName: state.incomingEvents.getLeftName(state.selectedNamespace),
          rightName: state.incomingEvents.getRightName(state.selectedNamespace),
        },
      });
    });

    (async () => {
      console.log(`sync overlay`);
      const { store, connectedClients } = await ipcRenderer.invoke(
        "overlay:sync"
      );
      state.connectedClients = connectedClients;
      Object.keys(store).forEach((ns) => {
        store[ns].sets = [
          ...store[ns].sets.map(
            (set: any) =>
              new Set(
                set.events.map(
                  (ev: any) => new GameEvent(ev.type, ev.timestamp)
                )
              )
          ),
        ];
      });
      state.incomingEvents = new EventStore(store);
      state.leftName = state.incomingEvents.getLeftName(
        state.selectedNamespace
      );
      state.rightName = state.incomingEvents.getRightName(
        state.selectedNamespace
      );
      ipcRenderer.on("wss:sync", (ch: any, event: any) => {
        console.log(`wss:sync`, event);
      });
      ipcRenderer.on("wss:event", (ch: any, msg: any) => {
        const { namespace } = msg.metadata;
        const ev = msg.spec.event;
        state.incomingEvents.set(
          namespace,
          new GameEvent(ev.type, ev.timestamp)
        );
        console.log(`wss:event`, event);
      });
      ipcRenderer.on("wss:controlevent", (ch: any, msg: any) => {
        const { namespace } = msg.metadata;
        console.log(`wss:controlevent`, msg);
        switch (msg.spec.event) {
          case EVENT_UNDO:
            state.incomingEvents.undo(namespace);
            break;
          case EVENT_NEW_SET:
            state.incomingEvents.createSet(namespace);
            break;
          case EVENT_RESET:
            state.incomingEvents.reset(namespace);
            break;
          default:
            break;
        }
      });
    })();

    const resetClicker = () => {
      console.log(`reset clicker`);
      const ns = state.selectedNamespace;
      state.incomingEvents.reset(ns);
      ipcRenderer.invoke("overlay:reset:clicker", {
        namespace: ns,
      });
    };

    onUnmounted(() => {
      ipcRenderer.removeAllListeners("wss:sync");
      ipcRenderer.removeAllListeners("wss:event");
      ipcRenderer.removeAllListeners("wss:controlevent");
    });

    const leftGoals = (events: any) => {
      return events.filter((e: any) => e.type == TYPE_L_GOAL).length;
    };

    const rightGoals = (events: any) => {
      return events.filter((e: any) => e.type == TYPE_R_GOAL).length;
    };

    return {
      state,
      leftGoals,
      rightGoals,
      events: state.incomingEvents.get(state.selectedNamespace),
      getEventName,
      resetClicker,
    };
  },
};
</script>

<style scoped>

.select-wrapper {
  display: flex;
}

.select-wrapper .namespace-selector {
  margin-right: 1em;
}
</style>
