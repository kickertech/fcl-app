import {
  GameEvent,
  getType,
  TYPE_START,
  TYPE_END,
  TYPE_L_GOAL,
  TYPE_R_GOAL,
} from "./GameEvents";
import { mapBarStats } from "./Statistics";

export type GoalStat = {
  // the number of goals at a given timestamp
  value: number;
  timestamp: number;
};

// GoalStatistics is an aggregated view of game events
// to make plotting easier
export type GoalStatistics = {
  left: GoalStat[];
  right: GoalStat[];
};

export class Set {
  events = [] as GameEvent[];

  constructor(events = [] as GameEvent[]) {
    this.events = events;
  }

  startTime(): number {
    const start = this.events.find(getType(TYPE_START)) || ({} as GameEvent);
    return start.timestamp;
  }
  
  endTime(): number {
    const end = this.events.find(getType(TYPE_END)) || ({} as GameEvent);
    return end.timestamp;
  }

  score(): number[] {
    const lgoals = this.events.filter(getType(TYPE_L_GOAL)).length;
    const rgoals = this.events.filter(getType(TYPE_R_GOAL)).length;
    if (!lgoals && !rgoals) {
      return [0, 0];
    }
    return [lgoals, rgoals];
  }

  finished() {
    const evt = this.events[this.events.length - 1];
    if (evt && evt.type == TYPE_END) {
      return true;
    }
    return false;
  }

  undo(): GameEvent | undefined {
    return this.events.pop();
  }

  pushEvent(evt: GameEvent) {
    const events = this.events;
    events.push(evt);
    this.events = [...events];
  }

  lastEvent(): GameEvent | undefined {
    if (this.events.length == 0) {
      return undefined;
    }
    return this.events[this.events.length - 1];
  }

  getStatistics() {
    return {
      left: mapBarStats("L", this.events),
      right: mapBarStats("R", this.events),
    };
  }

  reset() {
    this.events = [];
  }

  goalStatistics(): GoalStatistics {
    const out = {
      left: [] as GoalStat[],
      right: [] as GoalStat[],
    };
    let left = 0;
    let right = 0;
    const start = this.startTime();

    if (this.events.length == 0 || !start) {
      return out;
    }

    out.left.push({ value: 0, timestamp: start });
    out.right.push({ value: 0, timestamp: start });

    this.events.forEach((e) => {
      if (e.type == TYPE_L_GOAL) {
        out.left.push({
          value: ++left,
          timestamp: e.timestamp,
        });
        out.right.push({
          value: right,
          timestamp: e.timestamp,
        });
      }
      if (e.type == TYPE_R_GOAL) {
        out.right.push({
          value: ++right,
          timestamp: e.timestamp,
        });
        out.left.push({
          value: left,
          timestamp: e.timestamp,
        });
      }
    });
    return out;
  }
}
