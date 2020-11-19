import logger from "@/logger";
import { EventStore } from "@kickertech/common/store/EventStore";
import { ipcMain } from "electron";
import {
  handleGameUpdate,
  handleOverlaySync,
  handleResetClicker,
  OVERLAY_GAME_UPDATE,
  OVERLAY_RESET_CLICKER,
  OVERLAY_SYNC,
} from "./Overlay";
import {
  SETTINGS_UPDATE,
  SETTINGS_DISCONNECT_CLIENTS,
  SETTINGS_SYNC,
  handleServerUpdate,
  handleDisconnectClients,
  handleSettingsSync,
} from "./Settings";

export const initIPCHandler = (eventStore: EventStore) => {
  logger.info(`registering IPC handler`);
  ipcMain.handle(SETTINGS_UPDATE, handleServerUpdate);
  ipcMain.handle(SETTINGS_DISCONNECT_CLIENTS, handleDisconnectClients);
  ipcMain.handle(SETTINGS_SYNC, handleSettingsSync);
  ipcMain.handle(OVERLAY_SYNC, handleOverlaySync(eventStore));
  ipcMain.handle(OVERLAY_GAME_UPDATE, handleGameUpdate(eventStore));
  ipcMain.handle(OVERLAY_RESET_CLICKER, handleResetClicker(eventStore))
};
