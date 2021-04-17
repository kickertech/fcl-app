import { EventStore } from "@kickertech/common/store/EventStore";
import { serverSync } from "@kickertech/common/socket/api";
import { flush } from "../flush";
import logger from "./../../logger";
import { appDir } from "./../../config";
import { wss } from "../wss";
import path from "path";
import { dialog } from "electron";
import { promises as fsp } from 'fs';
import mkdirp from "mkdirp";
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

export const OVERLAY_OPEN_FILESELECT = "overlay:fileselect:logo";
export const handleFileselect = (eventStore: EventStore) => async (event: any, msg: any) => {
  const targetDir = path.join(appDir(), "logos", msg.position)
  await mkdirp(targetDir)
  const file = await dialog
    .showOpenDialog({
      title: "Select the File to be uploaded",
      defaultPath: path.join(__dirname),
      buttonLabel: "Upload",
      filters: [],
      properties: ["openFile"],
    })

  if (file.canceled) {
    return;
  }
  const selectedFile = file.filePaths[0].toString();
  const filename = path.basename(selectedFile);

  //
  const targetPath = path.join(targetDir, filename)
  await fsp.copyFile(selectedFile, targetPath)
  switch (msg.position) {
    case "left":
      eventStore.setLeftLogo(msg.namespace, targetPath)
      break;
    case "right":
      eventStore.setRightLogo(msg.namespace, targetPath)
      break;
      case "streamer":
        eventStore.setStreamerLogo(msg.namespace, targetPath)
        break;
    default:
      logger.error("unexpected position")
  }
  return {
    file: targetPath
  }
}

export const OVERLAY_CLEAR_LOGO = "overlay:clear:logo";
export const handleClearLogo = (eventStore: EventStore) => async (event: any, msg: any) => {
  switch (msg.position) {
    case "left":
      eventStore.setLeftLogo(msg.namespace, "")
      break;
    case "right":
      eventStore.setRightLogo(msg.namespace, "")
      break;
      case "streamer":
        eventStore.setStreamerLogo(msg.namespace, "")
        break;
    default:
      logger.error("unexpected position")
  }
}
