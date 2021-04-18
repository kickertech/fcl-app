import { EventStore } from "@kickertech/common/store/EventStore";
import { appDir } from "../config";
import path from "path";
import { promises as fs } from "fs";

export const flush = async (store: EventStore, namespace: string) => {
  const baseDir = path.join(appDir(), "data");
  try {
    await fs.mkdir(baseDir);
  } catch (_) { /* */ }

  const rightName = store.getRightName(namespace);
  const leftName = store.getLeftName(namespace);
  const currentSet = store.getCurrentSet(namespace);
  try {
    await fs.writeFile(path.join(baseDir, "leftName"), leftName);
    await fs.writeFile(path.join(baseDir, "rightName"), rightName);

    const [leftScore, rightScore] = currentSet.score();
    await fs.writeFile(path.join(baseDir, "leftScore"), leftScore);
    await fs.writeFile(path.join(baseDir, "rightScore"), rightScore);
  } catch (e) {
    console.log(e);
  }
};

// todo: add timer interval
