import express from "express";
import path from "path";
import { appDir } from "../config"
import { EventStore } from "@kickertech/common/store/EventStore";

const removeAppPrefix = (p: string) => {
  return p.replace(path.join(appDir(), "logos/") , "").replace(/\\/g, '/')
}

const createOverlayServer = (eventStore: EventStore) => {
  const app = express();

  app.get("/", (req, res) => {
    res.sendFile(path.join(__static, "overlay", "index.html"))
  })

  app.get("/assets/*", (req, res) => {
    const fp = req.path.replace("/assets/", "")
    const desiredPath = path.join(appDir(), "logos", fp)
    if(desiredPath.indexOf(appDir()) != 0){
      return res.status(401).end()
    }
    res.sendFile(desiredPath)
  })

  app.get("/api", (req, res) => {
    const namespace = "default"
    // right now, we only support overlays for the default namespace
    // multi-table support must be added here
    const lname = eventStore.getLeftName(namespace);
    const rname = eventStore.getRightName(namespace);
    const llogo = eventStore.getLeftLogo(namespace);
    const rlogo = eventStore.getRightLogo(namespace);
    const streamerlogo = eventStore.getStreamerLogo(namespace);
    const set = eventStore.getCurrentSet(namespace);
    let lwon = 0
    let rwon = 0;
    let lgoals = 0;
    let rgoals = 0;

    [lgoals, rgoals] = set.score()
    const sets = eventStore.getSets(namespace)
    sets.pop()
    sets.forEach((set) => {
      const [lgoals, rgoals] = set.score()
      if (lgoals > rgoals) {
        lwon++
      } else {
        rwon++
      }
    })

    res.json({
      leftName: lname,
      rightName: rname,
      leftLogo: removeAppPrefix(llogo),
      rightLogo: removeAppPrefix(rlogo),
      leftScore: lgoals,
      rightScore: rgoals,
      streamerLogo: removeAppPrefix(streamerlogo),
      matchpointsLeft: lwon,
      matchpointsRight: rwon,
    })
  })
  return app;
}


export {
  createOverlayServer
}
