export type EventType = string;

// TYPES
export const TYPE_UNDO: EventType = "-2";
export const TYPE_UNDEFINED: EventType = "-1";
export const TYPE_L_GOAL: EventType = "0";
export const TYPE_L_DEFENSE: EventType = "1";
export const TYPE_L_MID: EventType = "2";
export const TYPE_L_OFFENSE: EventType = "3";
export const TYPE_L_AT_GOAL: EventType = "4";
export const TYPE_L_TIMEOUT: EventType = "5";
export const TYPE_R_GOAL: EventType = "6";
export const TYPE_R_DEFENSE: EventType = "7";
export const TYPE_R_MID: EventType = "8";
export const TYPE_R_OFFENSE: EventType = "9";
export const TYPE_R_AT_GOAL: EventType = "10";
export const TYPE_R_TIMEOUT: EventType = "11";
export const TYPE_N_BALL_LOST: EventType = "12";

export const TYPE_START: EventType = "9000";
export const TYPE_END: EventType = "9001";

const typeToName = {
  [TYPE_UNDO]: "UNDO",
  [TYPE_UNDEFINED]: "UNDEFINED",
  [TYPE_L_GOAL]: "TYPE_L_GOAL",
  [TYPE_L_DEFENSE]: "TYPE_L_DEFENSE",
  [TYPE_L_MID]: "TYPE_L_MID",
  [TYPE_L_OFFENSE]: "TYPE_L_OFFENSE",
  [TYPE_L_AT_GOAL]: "TYPE_L_AT_GOAL",
  [TYPE_L_TIMEOUT]: "TYPE_L_TIMEOUT",
  [TYPE_R_GOAL]: "TYPE_R_GOAL",
  [TYPE_R_DEFENSE]: "TYPE_R_DEFENSE",
  [TYPE_R_MID]: "TYPE_R_MID",
  [TYPE_R_OFFENSE]: "TYPE_R_OFFENSE",
  [TYPE_R_AT_GOAL]: "TYPE_R_AT_GOAL",
  [TYPE_R_TIMEOUT]: "TYPE_R_TIMEOUT",
  [TYPE_N_BALL_LOST]: "TYPE_N_BALL_LOST",
  [TYPE_START]: "TYPE_START",
  [TYPE_END]: "TYPE_END"
};

export const lookup = (team: string) => (evtName: string): EventType => {
  let ret = TYPE_UNDEFINED;
  const key = `TYPE_${team.toUpperCase()}_${evtName}`;
  Object.keys(typeToName).forEach((type: string) => {
    if (typeToName[type] == key) {
      ret = type;
    }
  });
  return ret;
};

export const lookupName = (team: string) => (evtName: string): string => {
  const evt = lookup(team)(evtName);
  return typeToName[evt];
};

export const getEventName = (evt: EventType): string => {
  return typeToName[evt];
};

export class GameEvent {
  type = TYPE_UNDEFINED;
  timestamp = 0 as number;
  constructor(type: EventType, ts: number) {
    this.type = type;
    this.timestamp = ts;
  }

  toString(): string {
    return `${typeToName[this.type]}: ${this.timestamp}`;
  }

  toObject(): Record<string, any> {
    return {
      type: this.type,
      timestamp: this.timestamp
    }
  }

  static fromObject(obj: any): GameEvent {
    return new GameEvent(obj.type, obj.timestamp)
  }
}

export const EVENTS = {
  L_GOAL: () => new GameEvent(TYPE_L_GOAL, Date.now()),
  L_DEFENSE: () => new GameEvent(TYPE_L_DEFENSE, Date.now()),
  L_MID: () => new GameEvent(TYPE_L_MID, Date.now()),
  L_OFFENSE: () => new GameEvent(TYPE_L_OFFENSE, Date.now()),
  L_AT_GOAL: () => new GameEvent(TYPE_L_AT_GOAL, Date.now()),
  L_TIMEOUT: () => new GameEvent(TYPE_L_TIMEOUT, Date.now()),
  R_GOAL: () => new GameEvent(TYPE_R_GOAL, Date.now()),
  R_DEFENSE: () => new GameEvent(TYPE_R_DEFENSE, Date.now()),
  R_MID: () => new GameEvent(TYPE_R_MID, Date.now()),
  R_OFFENSE: () => new GameEvent(TYPE_R_OFFENSE, Date.now()),
  R_AT_GOAL: () => new GameEvent(TYPE_R_AT_GOAL, Date.now()),
  R_TIMEOUT: () => new GameEvent(TYPE_R_TIMEOUT, Date.now()),
  N_BALL_LOST: () => new GameEvent(TYPE_N_BALL_LOST, Date.now()),
  START: () => new GameEvent(TYPE_START, Date.now()),
  END: () => new GameEvent(TYPE_END, Date.now()),
  UNDO: () => new GameEvent(TYPE_UNDO, Date.now())
};

export type EventFilter = (
  events: GameEvent[],
  types: EventType[],
  prevType: EventTypePredicate
) => GameEvent[];

export type EventTypePredicate = (e: EventType) => boolean;

export const getTypes = (types: EventType[]) => (e: GameEvent) =>
  types.includes(e.type.toString());
export const notTypes = (types: EventType[]) => (e: GameEvent) =>
  !types.includes(e.type.toString());
export const getType = (type: EventType) => getTypes([type]);
export const notType = (type: EventType) => notTypes([type]);

export const hasPrev = (
  events: GameEvent[],
  types: EventType[],
  prevType: EventTypePredicate
) => {
  return events.filter((e, i, coll) => {
    return (
      i > 0 &&
      types.includes(e.type.toString()) &&
      prevType(coll[i - 1].type.toString())
    );
  });
};

export const hasNext = (
  events: GameEvent[],
  types: EventType[],
  prevType: EventTypePredicate
) => {
  return events.filter((e, i, coll) => {
    return (
      i < coll.length - 1 &&
      types.includes(e.type.toString()) &&
      prevType(coll[i + 1].type)
    );
  });
};

export const includes = (types: EventType[]) => (e: EventType) => {
  return types.includes(e.toString());
};

export const isLeft = () => (e: EventType) => {
  const name = typeToName[e];
  if (!name) {
    return false;
  }
  return name.startsWith("TYPE_L");
};

export const isRight = () => (e: EventType) => {
  const name = typeToName[e];
  if (!name) {
    return false;
  }
  return name.startsWith("TYPE_R");
};

// removes a sequence if event types from the event list
export const removeEventSequence = (
  events: GameEvent[],
  types: EventType[]
) => {
  const out = [...events];
  const typeMap = events.map(e => e.type);
  typeMap.forEach((_, i, coll) => {
    if (i >= coll.length - types.length) {
      return;
    }
    const allMatch = types.every((t, ti) => {
      return coll[i + ti] == t;
    });
    if (allMatch) {
      out.splice(i, types.length);
    }
  });
  return out;
};
export const not = (fn: EventTypePredicate) => (e: EventType) => !fn(e);
