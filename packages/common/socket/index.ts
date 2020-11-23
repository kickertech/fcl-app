import { reactive, watch } from "vue";
import { get, set } from "../store/SettingsStore";
import { EventStore } from "../store/EventStore";
import { parse } from "./api/parser";
import { clientSync } from "./api";
import { GameEvent } from "../game";

// connection state
export const STATE_CONNECTED = "connected";
export const STATE_DISCONNECTED = "disconnected";
export const STATE_ERROR = "error";
export const STATE_UNKNOWN = "unknown";

const STORE_URL = "API_SERVER";

let conn: WebSocket;

const state = reactive({
  url: get(STORE_URL),
  connectionState: STATE_UNKNOWN,
  // events are used by the clicker to store tracked events
  events: new EventStore(),
});

const sendEvent = (data: string) => {
  if (!conn || conn.readyState != 1) {
    console.warn(`trying to write on non-ready socket`);
    return;
  }
  conn.send(data);
};

function connect(state: any) {
  if (state.url == null) {
    const stop = watch(
      () => state.url,
      () => {
        stop();
        connect(state);
      }
    );
    return;
  }

  conn = new WebSocket(state.url);
  conn.onopen = (ev: Event) => {
    console.log(`websocket onopen`, ev);
    state.connectionState = STATE_CONNECTED;
  };
  conn.onmessage = (ev: any) => {
    console.log(ev.data);
    const msg = parse(ev.data);
    if (msg == null) {
      console.warn(`could not parse message: ${ev.data}`);
      return;
    }
    const { namespace, resourceVersion } = msg.metadata;
    let events = [] as GameEvent[];

    switch (msg.kind) {
      case "Sync":
        if (!state.events.has(namespace)) {
          console.warn(`invalid sync request for namespace ${namespace}`);
          break;
        }
        sendEvent(
          clientSync(
            namespace,
            state.events.get(namespace),
            state.events.getVersion(namespace)
          )
        );
        break;

      case "ServerSync":
        events = msg.spec.events;
        state.events.setEvents(namespace, resourceVersion, events);
        break;
      default:
        console.warn(`invalid message: ${msg.kind}`);
    }
  };
  conn.onerror = (ev: Event) => {
    console.log(`websocket onerror ${ev}`);
    state.connectionState = STATE_ERROR;
  };
  conn.onclose = (ev: CloseEvent) => {
    console.log(`websocket onclose`, ev);
    state.connectionState = STATE_DISCONNECTED;

    // try to reconnect
    setTimeout(function() {
      console.log("reconnecting");
      connect(state);
    }, 5000);
  };
}

const testConnection = (url: string) => {
  return new Promise((resolve, reject) => {
    const c = new WebSocket(url);
    let err: any;
    c.onopen = (ev) => {
      resolve(ev);
      c.close();
    };
    c.onerror = (e) => {
      err = e;
    };
    c.onclose = (ev) => {
      if (err) {
        reject(`websocket close event ${ev.code}`);
      }
    };
  });
};

watch(
  () => state.url,
  (url: any) => {
    console.log(`setting url: ${url}`);
    if (url !== null) {
      set(STORE_URL, url);
    }
  }
);

connect(state);

export { state, sendEvent, testConnection };
