export const KIND_CONTROL_EVENT = "ControlEvent";
export const controlEvent = (
  namespace = "default",
  event: string,
  resourceVersion = 0
): string => {
  return JSON.stringify({
    apiVersion: "game.fcl.io/v1alpha1",
    kind: KIND_CONTROL_EVENT,
    metadata: {
      namespace: namespace,
      resourceVersion: resourceVersion,
    },
    spec: {
      event: event,
    },
  });
};
