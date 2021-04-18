import { FclMessage } from '@kickertech/common/socket/api/parser';
import * as WebSocket from "ws";
import logger from "../../logger";
export const KIND_START_CLICKER = "StartClicker";
import { EventStore } from '@kickertech/common/store/EventStore';

export interface FclStartClicker extends FclMessage {
  spec: {};
}

const handleStartClicker = (ws: WebSocket, msg: FclStartClicker, store: EventStore, ipcSend: (channel: string, ...args: any[]) => void) => {
  logger.info("evt start clicker")
}

export {
  handleStartClicker
}
