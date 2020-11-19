import { EventStore } from "@kickertech/common/store/EventStore";
import { serverSync } from "@kickertech/common/socket/api";
import { flush } from "../flush";
import logger from "./../../logger";
import { wss } from "../wss";
import { FclMessage } from "@kickertech/common/socket/api/parser";

export const OVERLAY_SYNC = "overlay:sync";
export const handleOverlaySync = (eventStore: EventStore) => async (
  event: any,
  cfg: any
) => {
  logger.info("overlay:sync");
  return {
    store: eventStore.all(),
    connectedClients: wss ? wss.clients.size : 0,
  };
};

export const OVERLAY_GAME_UPDATE = "overlay:game:update";
export const handleGameUpdate = (eventStore: EventStore) => async (
  event: any,
  msg: any
) => {
  logger.info("overlay:game:update", msg);
  const { namespace, data } = msg;
  eventStore.setLeftName(namespace, data.leftName);
  eventStore.setRightName(namespace, data.rightName);
  flush(eventStore, namespace);
};

export const OVERLAY_RESET_CLICKER = "overlay:reset:clicker";
export const handleResetClicker = (eventStore: EventStore) => async (
  event: any,
  msg: any
) => {
  console.log(`got reset req`, msg);
  const { namespace } = msg;
  // reset internal state
  // send ServerSync message
  eventStore.reset(namespace);
  wss.clients.forEach((client) => {
    client.send(serverSync(namespace, [], 0));
  });
};
