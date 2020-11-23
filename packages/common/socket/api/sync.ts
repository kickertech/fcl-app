import { GameEvent } from "../../game";

export const KIND_CLIENT_SYNC = "ClientSync";
export const clientSync = (
  namespace = "default",
  events: GameEvent[],
  resourceVersion = 0
): string => {
  return JSON.stringify({
    apiVersion: "game.fcl.io/v1alpha1",
    kind: KIND_CLIENT_SYNC,
    metadata: {
      namespace: namespace,
      resourceVersion: resourceVersion,
    },
    spec: {
      events: events,
    },
  });
};

export const KIND_SERVER_SYNC = "ServerSync";
export const serverSync = (
  namespace = "default",
  events: GameEvent[],
  resourceVersion = 0
): string => {
  return JSON.stringify({
    apiVersion: "game.fcl.io/v1alpha1",
    kind: KIND_SERVER_SYNC,
    metadata: {
      namespace: namespace,
      resourceVersion: resourceVersion,
    },
    spec: {
      events: events,
    },
  });
};
