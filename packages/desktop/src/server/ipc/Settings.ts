import { updateConfig, initAccessKey, readConfig } from "../../config";
import { updateServerPassword, updateServerName } from "../";
import { getCertFingerprint } from "../../cert";
import { disconnectClients } from "../";
import logger from "./../../logger";

export const SETTINGS_UPDATE = "settings:update";
export const handleServerUpdate = async (event: any, cfg: any) => {
  let serverConfig = await readConfig();
  const fingerprint = await getCertFingerprint();
  Object.keys(cfg).forEach((k) => {
    serverConfig[k] = cfg[k];
  });

  await updateConfig(serverConfig);
  updateServerName(cfg.serverName, fingerprint);
  updateServerPassword(cfg.serverPassword);
  logger.info("updated settings");
};

export const SETTINGS_DISCONNECT_CLIENTS = "settings:disconnectClients";
export const handleDisconnectClients = () => {
  disconnectClients();
};

export const SETTINGS_SYNC = "settings:sync";
export const handleSettingsSync = async () => {
  logger.info("settings:sync");
  const cfg = await readConfig();
  const accessKey = await initAccessKey();
  const fingerprint = await getCertFingerprint();

  return {
    config: cfg,
    fingerprint: fingerprint,
    accessKey: accessKey,
  };
};
