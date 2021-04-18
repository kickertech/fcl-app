import https from "https";
import { promises as fs } from "fs";
import logger from "../logger";
import { initWebsocket, updateServerPassword, disconnectClients } from "./wss";
import { publishService, replaceService } from "./bonjour";
import { EventStore } from "@kickertech/common/store/EventStore";
import { initIPCHandler } from "./ipc";
import { createOverlayServer } from "./overlayserver";

const port = 9901;
const overlayPort = 9902;

const createServer = async (
  serverConfig: any,
  certPath: string,
  certKeyPath: string,
  accessKey: string,
  fingerprint: string,
  eventStore: EventStore,
  ipcSend: (channel: string, ...args: any[]) => void
) => {
  publishService(serverConfig.serverName, port, fingerprint);

  const server = https.createServer({
    cert: await fs.readFile(certPath),
    key: await fs.readFile(certKeyPath),
  });

  const overlayServer = createOverlayServer(eventStore);

  initWebsocket(
    server,
    accessKey,
    serverConfig.serverPassword,
    eventStore,
    ipcSend
  );
  initIPCHandler(eventStore);

  server.listen(port, () => {
    logger.info(`websocket server started on port ${port}`);
  });

  overlayServer.listen(overlayPort, () => {
    logger.info(`overlay server started on port ${overlayPort}`);
  })
};

const updateServerName = async (name: string, fingerprint: string) => {
  try {
    replaceService(name, port, fingerprint);
  } catch (e) {
    logger.error("unable to update server name", e);
  }
};

export {
  createServer,
  updateServerName,
  updateServerPassword,
  disconnectClients,
};
