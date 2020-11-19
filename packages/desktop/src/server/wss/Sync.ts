import { FclMessage } from "@kickertech/common/socket/api/parser";
import * as WebSocket from "ws";
import { GameEvent } from "@kickertech/common/game/GameEvents";
import { EventStore } from "@kickertech/common/store/EventStore";
import { flush } from "../flush";
import { serverSync } from "@kickertech/common/socket/api";

export const ROLE_READER = "reader";

export interface FclSync extends FclMessage {
  spec: {
    events: GameEvent[];
  };
}

// the sync event is sent upon request of the server
// this updates the internal state
export const handleClientSync = (
  ws: WebSocket,
  msg: FclSync,
  store: EventStore,
  ipcSend: (channel: string, ...args: any[]) => void
) => {
  const { namespace, resourceVersion } = msg.metadata;
  const { events } = msg.spec;
  store.setEvents(namespace, resourceVersion, events);
  console.log(ipcSend);
  ipcSend("wss:sync", msg);
  flush(store, namespace);
};

// the sync event is sent upon request of the server
// this updates the internal state
export const handleServerSync = (
  ws: WebSocket,
  msg: FclSync,
  store: EventStore,
  ipcSend: (channel: string, ...args: any[]) => void
) => {
  const { namespace } = msg.metadata;
  ws.send(
    serverSync(namespace, store.get(namespace), store.getVersion(namespace))
  );
};
