export interface FclMessage {
  apiVersion: string;
  kind: string;
  metadata: FclMetadata;
  spec: Record<string, any>;
}

export interface FclMetadata {
  namespace: string;
  resourceVersion: number;
}

// todo: support multiple versions
export const parse = (data: string): FclMessage | null => {
  let msg = null;
  try {
    msg = JSON.parse(data);
  } catch (e) {
    console.log(e);
  }
  if(!msg) {
    return null
  }
  
  // TODO: proper validation
  msg.metadata.namespace = msg.metadata.namespace || "default"
  return msg;
};

