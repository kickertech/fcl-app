import { FclMessage } from "@kickertech/common/socket/api/parser";
import * as WebSocket from "ws";
import logger from "../../logger";
import { flush } from "../flush";
import { GameEvent, TYPE_UNDO } from "@kickertech/common/game/GameEvents";
import { EventStore } from "@kickertech/common/store/EventStore";

export const KIND_EVENT = "Event";
export interface FclEvent extends FclMessage {
  spec: {
    event: GameEvent;
  };
}

const handleEvent = (
  ws: WebSocket,
  msg: FclEvent,
  store: EventStore,
  ipcSend: (channel: string, ...args: any[]) => void
) => {
  const { namespace, resourceVersion } = msg.metadata;
  const ev = GameEvent.fromObject(msg.spec.event);

  // check resourceVersion
  // send sync signal to push all events to the server
  if (store.versionConflict(namespace, resourceVersion)) {
    logger.warn(`skipped events due to resourceVersion mismatch. forcing sync`);
    ws.send(
      JSON.stringify({
        apiVersion: "game.fcl.io/v1alpha1",
        metadata: {
          namespace,
        },
        kind: "Sync",
      })
    );
    return;
  }
  // push event to client
  ipcSend("wss:event", msg);
  store.set(namespace, ev);
  flush(store, namespace);
};

export { handleEvent };
