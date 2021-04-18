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
              <iframe
                class="overlay-preview"
                src="http://localhost:9902"
              ></iframe>
            </ion-col>
          </ion-row>
          <ion-item-divider>
            <ion-label> </ion-label>
          </ion-item-divider>
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
            <ion-col size="3">
              <ion-item>
                <ion-label position="stacked">Set points Left</ion-label>
                <ion-input disabled="true">{{
                  state.incomingEvents
                    .getCurrentSet(state.selectedNamespace)
                    .score()[0]
                }}</ion-input>
              </ion-item>
            </ion-col>
            <ion-col size="3">
              <ion-item>
                <ion-label position="stacked">Matchpoints Left</ion-label>
                <ion-input disabled="true">{{
                  matchPoints(
                    state.incomingEvents.getSets(state.selectedNamespace)
                  )[0]
                }}</ion-input>
              </ion-item>
            </ion-col>
            <ion-col size="3">
              <ion-item>
                <ion-label position="stacked">Set points Right</ion-label>
                <ion-input disabled="true">{{
                  state.incomingEvents
                    .getCurrentSet(state.selectedNamespace)
                    .score()[1]
                }}</ion-input>
              </ion-item>
            </ion-col>
            <ion-col size="3">
              <ion-item>
                <ion-label position="stacked">Matchpoints Right</ion-label>
                <ion-input disabled="true">{{
                  matchPoints(
                    state.incomingEvents.getSets(state.selectedNamespace)
                  )[1]
                }}</ion-input>
              </ion-item>
            </ion-col>
          </ion-row>
          <ion-row>
            <ion-col>
              <img class="logo" v-bind:class="{ empty: state.streamerLogo == '' }" v-bind:src="'asset://' + state.leftLogo" />
              <ion-button color="light" @click="uploadLogo('left')"
                >Upload Logo</ion-button
              >
              <ion-button color="danger" @click="clearLogo('left')"
                >Clear Logo</ion-button
              >
            </ion-col>
            <ion-col>
              <img class="logo" v-bind:class="{ empty: state.streamerLogo == '' }" v-bind:src="'asset://' + state.rightLogo" />
              <ion-button color="light" @click="uploadLogo('right')"
                >Upload Logo</ion-button
              >
              <ion-button color="danger" @click="clearLogo('right')"
                >Clear Logo</ion-button
              >
            </ion-col>
          </ion-row>
          <ion-item-divider>
            <ion-label> </ion-label>
          </ion-item-divider>
          <ion-row>
            <ion-col size="6">
              <ion-label class="ion-text-wrap">Streamer Logo</ion-label>
              <p>
                Upload your Logo here. It will be displayed on the streaming
                overlay. You can preview it
                <a target="_blank" href="http://localhost:9902">here</a>.
              </p>
              <img
                class="logo"
                v-bind:class="{ empty: state.streamerLogo == '' }"
                v-bind:src="'asset://' + state.streamerLogo"
              />
              <ion-button color="light" @click="uploadLogo('streamer')"
                >Upload Streamer Logo</ion-button
              >
              <ion-button color="danger" @click="clearLogo('streamer')"
                >Clear Logo</ion-button
              >
            </ion-col>
            <ion-col size="6">
              <div id="logs">
                <h3>Event Log</h3>
                <div
                  v-for="(set, i) in state.incomingEvents.getSets(
                    state.selectedNamespace
                  )"
                  :key="i"
                  class="set"
                >
                  <h3>Set {{ i + 1 }}</h3>
                  <ul class="event-list">
                    <li v-for="(event, j) in set.events" :key="j">
                      {{ event.toString() }}
                    </li>
                  </ul>
                </div>
              </div>
            </ion-col>
          </ion-row>
          <ion-item-divider>
            <ion-label> </ion-label>
          </ion-item-divider>
          <ion-row>
            <ion-col>
              <ion-button color="danger" @click="resetClicker()"
                >RESET CLICKER</ion-button
              >
            </ion-col>
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
  IonItemDivider,
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
    IonItemDivider,
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
      leftLogo: "",
      rightName: "",
      rightLogo: "",
      streamerLogo: "",
      connectedClients: 0,
      incomingEvents: new EventStore(),
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
      state.leftLogo = state.incomingEvents.getLeftLogo(
        state.selectedNamespace
      );
      state.rightName = state.incomingEvents.getRightName(
        state.selectedNamespace
      );
      state.rightLogo = state.incomingEvents.getRightLogo(
        state.selectedNamespace
      );
      state.streamerLogo = state.incomingEvents.getStreamerLogo(
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

    const uploadLogo = (pos: string) => {
      ipcRenderer
        .invoke("overlay:fileselect:logo", {
          position: pos,
          namespace: state.selectedNamespace,
        })
        .then((result) => {
          switch (pos) {
            case "left":
              state.leftLogo = result.file;
              break;
            case "right":
              state.rightLogo = result.file;
              break;
            case "streamer":
              state.streamerLogo = result.file;
              break;
          }
        });
    };

    const clearLogo = (pos: string) => {
      ipcRenderer
        .invoke("overlay:clear:logo", {
          position: pos,
          namespace: state.selectedNamespace,
        })
        .then(() => {
          switch (pos) {
            case "left":
              state.leftLogo = "";
              break;
            case "right":
              state.rightLogo = "";
              break;
            case "streamer":
              state.streamerLogo = "";
              break;
          }
        });
    };

    const matchPoints = (sets: Set[]) => {
      let lwon = 0;
      let rwon = 0;
      sets.pop(); // ignore current set
      sets.forEach((set) => {
        const [lgoals, rgoals] = set.score();
        if (lgoals > rgoals) {
          lwon++;
        } else {
          rwon++;
        }
      });

      return [lwon, rwon];
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
      uploadLogo,
      clearLogo,
      matchPoints,
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

.logo {
  display: block;
  margin: 10px auto;
  width: auto;
  height: 150px;
  border: 1px solid #ddd;
}

.logo.empty {
  background: lightgrey;
  border: 1px solid darkgrey;
}
.overlay-preview {
  width: 100%;
  border: 1px solid #666;
  background: indianred;
}

.event-list {
  max-height: 300px;
  overflow-y: scroll;
}
</style>
