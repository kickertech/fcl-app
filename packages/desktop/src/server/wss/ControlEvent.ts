import { FclMessage } from "@kickertech/common/socket/api/parser";
import { EventStore } from "@kickertech/common/store/EventStore";
import {
  EVENT_NEW_SET,
  EVENT_RESET,
  EVENT_UNDO,
} from "@kickertech/common/game/ControlEvents";
import * as WebSocket from "ws";
import logger from "../../logger";
import { flush } from "../flush";

export const KIND_CONTROL_EVENT = "ControlEvent";
export interface FclControlEvent extends FclMessage {
  spec: {
    event: string;
  };
}

const handleControlEvent = (
  ws: WebSocket,
  msg: FclControlEvent,
  store: EventStore,
  ipcSend: (channel: string, ...args: any[]) => void
) => {
  logger.info("ControlEvent", msg);
  const { namespace } = msg.metadata;

  switch (msg.spec.event) {
    case EVENT_UNDO:
      // update state
      store.undo(namespace);
      break;
    case EVENT_NEW_SET:
      store.createSet(namespace);
      break;
    case EVENT_RESET:
      store.reset(namespace);
      break;
    default:
      break;
  }

  ipcSend("wss:controlevent", msg);
  flush(store, namespace);
};

export { handleControlEvent };
