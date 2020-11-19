import { FclMessage } from '@kickertech/common/socket/api/parser';
import * as WebSocket from "ws";
export const KIND_START_CLICKER = "StartClicker";
import { EventStore } from '@kickertech/common/store/EventStore';

export interface FclStartClicker extends FclMessage {
  spec: {}
}

const handleStartClicker = (ws: WebSocket, msg: FclStartClicker, store: EventStore, ipcSend: (channel: string, ...args: any[]) => void) => {
}

export {
  handleStartClicker
}