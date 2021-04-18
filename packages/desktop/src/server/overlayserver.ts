import express from "express";
import path from "path";
import { appDir } from "../config"
import { EventStore } from "@kickertech/common/store/EventStore";

const createOverlayServer = (eventStore: EventStore) => {
  const app = express();

  app.get("/", (req, res) => {
    res.sendFile(path.join(__static, "overlay", "index.html"))
  })

  app.get("/logo/:name", (req, res) => {
    const name = path.basename(req.params.name)
    res.sendFile(path.join(appDir(), "logos", name))
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
      leftLogo: path.basename(llogo),
      rightLogo: path.basename(rlogo),
      leftScore: lgoals,
      rightScore: rgoals,
      streamerLogo: path.basename(streamerlogo),
      matchpointsLeft: lwon,
      matchpointsRight: rwon,
    })
  })
  return app;
}


export {
  createOverlayServer
}
