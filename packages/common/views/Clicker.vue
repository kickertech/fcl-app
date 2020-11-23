<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-menu-button></ion-menu-button>
        </ion-buttons>
        <ion-title>Clicker</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true">
      <ion-header collapse="condense">
        <ion-toolbar>
          <ion-title size="large">Clicker</ion-title>
        </ion-toolbar>
      </ion-header>

      <div id="clicker">
        <ion-grid>
          <ion-row>
            <ion-col size="12">
              <ion-button
                v-bind:class="{
                  'last-event': isLastEvent(
                    state.namespace,
                    websocketState.events.get(state.namespace),
                    GameEvents.TYPE_R_GOAL
                  ),
                }"
                color="danger"
                @click="pushEvent(GAME_EVENTS.R_GOAL())"
                >GOAL</ion-button
              >
            </ion-col>
          </ion-row>
          <ion-row>
            <ion-col size="6">
              <ion-button
                v-bind:class="{
                  'last-event': isLastEvent(
                    state.namespace,
                    websocketState.events.get(state.namespace),
                    GameEvents.TYPE_L_DEFENSE
                  ),
                }"
                color="primary"
                @click="pushEvent(GAME_EVENTS.L_DEFENSE())"
                >DEFENSE</ion-button
              >
            </ion-col>
            <ion-col size="6">
              <ion-button
                color="danger"
                v-bind:class="{
                  'last-event': isLastEvent(
                    state.namespace,
                    websocketState.events.get(state.namespace),
                    GameEvents.TYPE_R_OFFENSE
                  ),
                }"
                @click="pushEvent(GAME_EVENTS.R_OFFENSE())"
                >OFFENSE</ion-button
              >
            </ion-col>
          </ion-row>
          <ion-row>
            <ion-col size="6">
              <ion-button
                color="primary"
                v-bind:class="{
                  'last-event': isLastEvent(
                    state.namespace,
                    websocketState.events.get(state.namespace),
                    GameEvents.TYPE_L_MID
                  ),
                }"
                @click="pushEvent(GAME_EVENTS.L_MID())"
                >MID</ion-button
              >
            </ion-col>
            <ion-col size="6">
              <ion-button
                v-bind:class="{
                  'last-event': isLastEvent(
                    state.namespace,
                    websocketState.events.get(state.namespace),
                    GameEvents.TYPE_R_MID
                  ),
                }"
                color="danger"
                @click="pushEvent(GAME_EVENTS.R_MID())"
                >MID</ion-button
              >
            </ion-col>
          </ion-row>
          <ion-row>
            <ion-col size="6">
              <ion-button
                color="primary"
                v-bind:class="{
                  'last-event': isLastEvent(
                    state.namespace,
                    websocketState.events.get(state.namespace),
                    GameEvents.TYPE_L_OFFENSE
                  ),
                }"
                @click="pushEvent(GAME_EVENTS.L_OFFENSE())"
                >OFFENSE</ion-button
              >
            </ion-col>
            <ion-col size="6">
              <ion-button
                color="danger"
                v-bind:class="{
                  'last-event': isLastEvent(
                    state.namespace,
                    websocketState.events.get(state.namespace),
                    GameEvents.TYPE_R_DEFENSE
                  ),
                }"
                @click="pushEvent(GAME_EVENTS.R_DEFENSE())"
                >DEFENSE</ion-button
              >
            </ion-col>
          </ion-row>
          <ion-row>
            <ion-col size="12">
              <ion-button
                color="primary"
                v-bind:class="{
                  'last-event': isLastEvent(
                    state.namespace,
                    websocketState.events.get(state.namespace),
                    GameEvents.TYPE_L_GOAL
                  ),
                }"
                @click="pushEvent(GAME_EVENTS.L_GOAL())"
                >GOAL</ion-button
              >
            </ion-col>
          </ion-row>
          <ion-row>
            <ion-col size="4">
              <ion-button
                v-bind:class="{
                  'last-event': isLastEvent(
                    state.namespace,
                    websocketState.events.get(state.namespace),
                    GameEvents.TYPE_L_TIMEOUT
                  ),
                }"
                color="primary"
                @click="pushEvent(GAME_EVENTS.L_TIMEOUT())"
                >TIMEOUT</ion-button
              >
            </ion-col>
            <ion-col size="4">
              <ion-button
                color="light"
                @click="pushEvent(GAME_EVENTS.N_BALL_LOST())"
                >BALL LOST</ion-button
              >
            </ion-col>
            <ion-col size="4">
              <ion-button
                v-bind:class="{
                  'last-event': isLastEvent(
                    state.namespace,
                    websocketState.events.get(state.namespace),
                    GameEvents.TYPE_R_TIMEOUT
                  ),
                }"
                color="danger"
                @click="pushEvent(GAME_EVENTS.R_TIMEOUT())"
                >Timeout</ion-button
              >
            </ion-col>
          </ion-row>
          <ion-row>
            <ion-col size="6">
              <ion-button color="dark">----</ion-button>
            </ion-col>
            <ion-col size="6">
              <ion-button color="dark" @click="newSet()">NEW SET</ion-button>
            </ion-col>
          </ion-row>
          <ion-row>
            <ion-col size="3">
              <b>Score</b>
              {{ leftGoals(websocketState.events.get(state.namespace)) }} :
              {{ rightGoals(websocketState.events.get(state.namespace)) }}
              <ul
                v-for="(set, i) in websocketState.events.all()[state.namespace]
                  .sets"
                :key="i"
              >
                <li>
                  Set {{ i + 1 }}: {{ leftGoals(set.events) }}:{{
                    rightGoals(set.events)
                  }}
                </li>
              </ul>
            </ion-col>
            <ion-col size="3"> <b>Timer</b> {{ state.timer }}s </ion-col>
            <ion-col size="3">
              <ion-button color="light" @click="undo()">UNDO</ion-button>
            </ion-col>
            <ion-col size="3">
              <ion-button color="light" @click="reset()">GAME RESET</ion-button>
            </ion-col>
          </ion-row>
        </ion-grid>
      </div>
    </ion-content>
  </ion-page>
</template>

<script lang="ts">
import {
  IonGrid,
  IonRow,
  IonCol,
  IonButtons,
  IonContent,
  IonHeader,
  IonMenuButton,
  IonPage,
  IonTitle,
  IonToolbar,
  IonButton,
} from "@ionic/vue";

import { reactive, watch } from "vue";
import * as GameEvents from "../game/GameEvents";
import * as ControlEvents from "../game/ControlEvents";
import { state as websocketState, sendEvent, STATE_CONNECTED } from "../socket";
import { event, controlEvent, serverSync } from "../socket/api";

export default {
  name: "Clicker",
  components: {
    IonGrid,
    IonRow,
    IonCol,
    IonButtons,
    IonContent,
    IonHeader,
    IonMenuButton,
    IonPage,
    IonTitle,
    IonToolbar,
    IonButton,
  },
  setup() {
    function isLastEvent(
      namespace: string,
      events: GameEvents.GameEvent[],
      type: any
    ): boolean {
      const evt = events[events.length - 1];
      if (evt && evt.type == type) {
        return true;
      }
      return false;
    }

    const state = reactive({
      namespace: "default",
      timer: 0,
      timerInterval: null as null | ReturnType<typeof setInterval>,
    });

    const pushControlEvent = (evt: any) => {
      sendEvent(
        controlEvent(
          state.namespace,
          evt,
          websocketState.events.getVersion(state.namespace)
        )
      );
    };

    const leftGoals = (events) => {
      return events.filter((e) => e.type == GameEvents.TYPE_L_GOAL).length;
    };

    const rightGoals = (events) => {
      return events.filter((e) => e.type == GameEvents.TYPE_R_GOAL).length;
    };

    const undo = () => {
      websocketState.events.undo(state.namespace);
      pushControlEvent(ControlEvents.EVENT_UNDO);
      state.timer = 0;
    };

    const reset = () => {
      websocketState.events.reset(state.namespace);
      state.timer = 0;
      clearTimeout(state.timerInterval);
      pushControlEvent(ControlEvents.EVENT_RESET);
    };

    const startTimer = () => {
      if (state.timerInterval) {
        clearInterval(state.timerInterval);
      }
      state.timer = 0;
      state.timerInterval = setInterval(() => {
        state.timer++;
      }, 1000);
    };

    const pushEvent = (evt: any) => {
      window.navigator.vibrate(100);
      websocketState.events.set(state.namespace, evt);
      startTimer();

      console.log(`pushing event data to server`);
      sendEvent(
        event(
          state.namespace,
          evt,
          websocketState.events.getVersion(state.namespace)
        )
      );
    };

    const newSet = () => {
      pushControlEvent(ControlEvents.EVENT_NEW_SET);

      // create set
      websocketState.events.createSet(state.namespace);
    };

    if (websocketState.connectionState == STATE_CONNECTED) {
      sendEvent(serverSync(state.namespace, [], 0));
    }
    // wait for connection and pull data
    watch(
      () => websocketState.connectionState,
      () => {
        if (websocketState.connectionState == STATE_CONNECTED) {
          sendEvent(serverSync(state.namespace, [], 0));
        }
      }
    );

    return {
      state,
      websocketState,
      GAME_EVENTS: GameEvents.EVENTS,
      GameEvents,
      pushEvent,
      newSet,
      leftGoals,
      rightGoals,
      undo,
      reset,
      isLastEvent,
    };
  },
};
</script>

<style scoped>
ion-menu-button {
  color: var(--ion-color-primary);
}

ion-button.md.button.button-solid.ion-activatable.ion-focusable.hydrated {
  width: 100%;
  height: 50px;
}

ion-button.last-event {
  --ion-color-base: #666666 !important;
}
</style>
