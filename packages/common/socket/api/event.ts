import { GameEvent } from "../../game";

export const KIND_EVENT = "Event";
export const event = (
  namespace = "default",
  event: GameEvent,
  resourceVersion = 0
): string => {
  return JSON.stringify({
    apiVersion: "game.fcl.io/v1alpha1",
    kind: KIND_EVENT,
    metadata: {
      namespace: namespace,
      resourceVersion: resourceVersion,
    },
    spec: {
      event: event.toObject(),
    },
  });
};
