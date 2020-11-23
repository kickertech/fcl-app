import { GameEvent, Set } from "../game";

type EventData = {
  resourceVersion: number;
  leftName: string;
  rightName: string;
  sets: Set[];
};

export class EventStore {
  public data = {} as Record<string, EventData>;

  constructor(
    data: Record<string, EventData> | null = {
      default: {
        resourceVersion: 0,
        leftName: "",
        rightName: "",
        sets: [new Set()],
      },
    }
  ) {
    if (data) {
      this.data = data;
    }
  }

  set(namespace: string, ev: GameEvent) {
    if (!this.data[namespace]) {
      this.data[namespace] = {
        resourceVersion: 0,
        leftName: "",
        rightName: "",
        sets: [new Set()],
      };
    }
    this.getCurrentSet(namespace).pushEvent(ev);
    this.incrementVersion(namespace);
  }

  setLeftName(namespace: string, name: string) {
    if (this.data[namespace]) {
      this.data[namespace].leftName = name;
    }
  }

  getLeftName(namespace: string) {
    if (this.data[namespace]) {
      return this.data[namespace].leftName;
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
      this.data[namespace] = {
        resourceVersion: 0,
        leftName: "",
        rightName: "",
        sets: [new Set()],
      };
    }
    return this.data[namespace].sets[this.data[namespace].sets.length - 1];
  }

  has(namespace: string) {
    return this.data[namespace];
  }

  setEvents(namespace: string, version: number, evs: GameEvent[]) {
    this.data[namespace] = {
      resourceVersion: version,
      leftName: "",
      rightName: "",
      sets: [new Set(evs)],
    };
  }

  setVersion(namespace: string, version: number) {
    if (!this.data[namespace]) {
      this.data[namespace] = {
        resourceVersion: 0,
        leftName: "",
        rightName: "",
        sets: [new Set()],
      };
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
    this.data[namespace] = {
      resourceVersion: 0,
      leftName: "",
      rightName: "",
      sets: [new Set()],
    };
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
      return this.data[namespace].sets;
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
      this.data[namespace] = {
        resourceVersion: 0,
        leftName: "",
        rightName: "",
        sets: [new Set()],
      };
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
