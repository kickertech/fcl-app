import { GameEvent, Set } from "../game";

type EventData = {
  resourceVersion: number;
  leftName: string;
  leftLogo: string;
  rightName: string;
  rightLogo: string;
  streamerLogo: string;
  sets: Set[];
};

export const defaultData = () => {
  return {
    resourceVersion: 0,
    leftName: "",
    leftLogo: "",
    rightName: "",
    rightLogo: "",
    streamerLogo: "",
    sets: [new Set()],
  }
}

export class EventStore {
  public data = {} as Record<string, EventData>;

  constructor(
    data: Record<string, EventData> | null = {
      default: defaultData()
    }
  ) {
    if (data) {
      this.data = data;
    }
  }

  set(namespace: string, ev: GameEvent) {
    if (!this.data[namespace]) {
      this.data[namespace] = defaultData();
    }
    this.getCurrentSet(namespace).pushEvent(ev);
    this.incrementVersion(namespace);
  }

  setLeftName(namespace: string, name: string) {
    if (this.data[namespace]) {
      this.data[namespace].leftName = name;
    }
  }

  setLeftLogo(namespace: string, path: string) {
    if (this.data[namespace]) {
      this.data[namespace].leftLogo = path;
    }
  }

  getLeftLogo(namespace: string) {
    if (this.data[namespace]) {
      return this.data[namespace].leftLogo;
    }
    return "";
  }

  getLeftName(namespace: string) {
    if (this.data[namespace]) {
      return this.data[namespace].leftName;
    }
    return "";
  }

  setRightLogo(namespace: string, path: string) {
    if (this.data[namespace]) {
      this.data[namespace].rightLogo = path;
    }
  }

  getRightLogo(namespace: string) {
    if (this.data[namespace]) {
      return this.data[namespace].rightLogo;
    }
    return "";
  }

  setStreamerLogo(namespace: string, path: string) {
    if (this.data[namespace]) {
      this.data[namespace].streamerLogo = path;
    }
  }

  getStreamerLogo(namespace: string) {
    if (this.data[namespace]) {
      return this.data[namespace].streamerLogo;
    }
    return "";
  }

  setRightName(namespace: string, name: string) {
    if (this.data[namespace]) {
      this.data[namespace].rightName = name;
    }
  }

  getRightName(namespace: string) {
    if (this.data[namespace]) {
      return this.data[namespace].rightName;
    }
    return "";
  }

  getCurrentSet(namespace: string) {
    if (!this.data[namespace]) {
      this.data[namespace] = defaultData();
    }
    return this.data[namespace].sets[this.data[namespace].sets.length - 1];
  }

  has(namespace: string) {
    return this.data[namespace];
  }

  setEvents(namespace: string, version: number, evs: GameEvent[]) {
    this.data[namespace].resourceVersion = version;
    this.data[namespace].sets = [new Set(evs)];
  }

  setVersion(namespace: string, version: number) {
    if (!this.data[namespace]) {
      this.data[namespace] = defaultData();
    }
    this.data[namespace].resourceVersion = version;
  }

  incrementVersion(namespace: string) {
    if (this.data[namespace]) {
      this.data[namespace].resourceVersion++;
    }
  }

  versionConflict(namespace: string, version: number) {
    if (!this.data[namespace]) {
      return false;
    }
    return version != this.data[namespace].resourceVersion + 1;
  }

  undo(namespace: string): GameEvent | null {
    if (this.data[namespace]) {
      const event = this.getCurrentSet(namespace).undo();
      if (!event) {
        return null;
      }
      this.incrementVersion(namespace);
      return event;
    }
    return null;
  }

  getNamespaces() {
    return Object.keys(this.data);
  }

  reset(namespace: string) {
    this.data[namespace].resourceVersion = 0;
    this.data[namespace].sets = [new Set()];
    return;
  }

  get(namespace: string): GameEvent[] {
    if (this.data[namespace]) {
      return this.getCurrentSet(namespace).events;
    }
    return [];
  }

  getSets(namespace: string): Set[] {
    if (this.data[namespace]) {
      return [...this.data[namespace].sets];
    }
    return [];
  }

  getVersion(namespace: string): number {
    if (this.data[namespace]) {
      return this.data[namespace].resourceVersion;
    }
    return 0;
  }

  createSet(namespace: string) {
    if (!this.data[namespace]) {
      this.data[namespace] = defaultData();
      return;
    }
    const sets = this.data[namespace].sets;
    sets.push(new Set());
    this.data[namespace].sets = [...sets];
  }

  all(): Record<string, EventData> {
    return this.data;
  }
}
