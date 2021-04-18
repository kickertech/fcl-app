import https from "https";
import * as WebSocket from "ws";
import logger from "../../logger";
import { parse } from "@kickertech/common/socket/api/parser";
import url from "url";
import { FclMessage } from "@kickertech/common/socket/api/parser";
import {
  KIND_START_CLICKER,
  handleStartClicker,
  FclStartClicker,
} from "./StartClicker";
import { FclEvent, handleEvent, KIND_EVENT } from "./Event";
//import { FclRegister, handleRegister, KIND_REGISTER } from "./Register";
import { EventStore } from "@kickertech/common/store/EventStore";
import { FclSync, handleClientSync, handleServerSync } from "./Sync";
import { KIND_CLIENT_SYNC, KIND_SERVER_SYNC } from "@kickertech/common/socket/api"

import {
  FclControlEvent,
  handleControlEvent,
  KIND_CONTROL_EVENT,
} from "./ControlEvent";

export const RootHandler = (
  ws: WebSocket,
  msg: FclMessage,
  store: EventStore,
  ipcSend: (channel: string, ...args: any[]) => void
) => {
  console.log(`handling ${msg.kind}: ${JSON.stringify(msg)}`);
  switch (msg.kind) {
    case KIND_START_CLICKER:
      handleStartClicker(ws, msg as FclStartClicker, store, ipcSend);
      break;
    case KIND_EVENT:
      handleEvent(ws, msg as FclEvent, store, ipcSend);
      break;
    case KIND_CLIENT_SYNC:
      handleClientSync(ws, msg as FclSync, store, ipcSend);
      break;
    case KIND_SERVER_SYNC:
      handleServerSync(ws, msg as FclSync, store, ipcSend)
      break;
    case KIND_CONTROL_EVENT:
      handleControlEvent(ws, msg as FclControlEvent, store, ipcSend);
      break;
    default:
      break;
  }
};

const authenticator = {
  accessKey: "",
  serverPassword: "",
  authenticate: function(req: any) {
    const params = url.parse(req.url, true).query;

    if (
      params.access_key &&
      this.accessKey &&
      params.access_key.toString().toUpperCase() == this.accessKey.toUpperCase()
    ) {
      return true;
    }
    if (
      params.server_password &&
      this.serverPassword &&
      params.server_password.toString().toUpperCase() ==
        this.serverPassword.toUpperCase()
    ) {
      return true;
    }
    logger.info("invalid authentication token", params);
    return false;
  },
};

const updateServerPassword = (pass: string) => {
  authenticator.serverPassword = pass;
};

export let wss: WebSocket.Server;

const initWebsocket = (
  server: https.Server,
  accessKey: string,
  serverPassword: string,
  eventStore: EventStore,
  ipcSend: (channel: string, ...args: any[]) => void
) => {
  wss = new WebSocket.Server({
    verifyClient: (info, cb) => {
      const ok = authenticator.authenticate(info.req);
      if (!ok) {
        return cb(ok, 401, "Unauthorized");
      }
      return cb(ok);
    },
    server,
  });

  authenticator.accessKey = accessKey;
  authenticator.serverPassword = serverPassword;
  server.on("upgrade", authenticator.authenticate.bind(authenticator));

  wss.on("connection", (ws: WebSocket) => {
    logger.info("client connected");

    ws.on("message", (message: string) => {
      const msg = parse(message);
      if (msg == null) {
        logger.error(`invalid message: ${message}`);
        return;
      }
      RootHandler(ws, msg, eventStore, ipcSend);
    });

    ws.on("close", () => {
      logger.info("client closed");
    });
  });
};

const disconnectClients = () => {
  for (const client of wss.clients) {
    client.close();
  }
};

export { initWebsocket, updateServerPassword, disconnectClients };
