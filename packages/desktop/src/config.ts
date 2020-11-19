import { promises as fs } from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import logger from "./logger";
import crypto from "crypto";

function appDir(): string {
  const baseDir =
    process.env.APPDATA ||
    (process.platform == "darwin"
      ? process.env.HOME + "/Library/Preferences"
      : process.env.HOME + "/.local/share");
  return path.join(baseDir, "fcl");
}

const certPath = path.join(appDir(), "server.crt");
const certKeyPath = path.join(appDir(), "server.key");
const accessKeyPath = path.join(appDir(), "access.key");
const serverConfigPath = path.join(appDir(), "server.json");

const genSimplePass = (num: number) => {
  const ran = Math.random().toString(36);
  const shasum = crypto.createHash("sha256");
  shasum.update(ran, "utf8");
  return shasum
    .digest("base64")
    .slice(1, num + 1)
    .toUpperCase();
};

const updateConfig = async (cfg: Record<string, any>) => {
  await fs.writeFile(serverConfigPath, JSON.stringify(cfg, null, 4));
};

const initConfig = async () => {
  // create config
  try {
    await fs.access(serverConfigPath);
  } catch (e) {
    logger.info("generating server config");
    updateConfig({
      serverName: "default",
      serverPassword: genSimplePass(8),
    });
  }
};

const readConfig = async (): Promise<any> => {
  const content = await fs.readFile(serverConfigPath);
  return JSON.parse(content.toString());
};

const initAccessKey = async (): Promise<string> => {
  let accessKey: string;
  try {
    accessKey = (await fs.readFile(accessKeyPath)).toString();
  } catch (e) {
    accessKey = uuidv4();
    await fs.writeFile(accessKeyPath, accessKey);
  }
  return accessKey;
};

export {
  certPath,
  certKeyPath,
  accessKeyPath,
  serverConfigPath,
  appDir,
  initAccessKey,
  initConfig,
  readConfig,
  updateConfig,
};
