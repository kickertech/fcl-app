import {
  GameEvent,
  getType,
  notTypes,
  not,
  hasPrev,
  hasNext,
  TYPE_L_GOAL,
  TYPE_R_GOAL,
  TYPE_L_AT_GOAL,
  TYPE_R_AT_GOAL,
  TYPE_L_TIMEOUT,
  TYPE_R_TIMEOUT,
  includes,
  removeEventSequence,
  isLeft,
  isRight,
  EventFilter,
  EventType,
  EventTypePredicate,
  lookup,
  getEventName
} from "./GameEvents";

// TeamStatistics contain metrics for a team
export type TeamStatistics = {
  defense: {
    retry: number;
    loss: number;
    goal: number;
    pass: number;
    atGoal: number;
  };
  mid: {
    retry: number;
    loss: number;
    goal: number;
    pass: number;
    atGoal: number;
    passRate: number;
  };
  offense: {
    retry: number;
    loss: number;
    goal: number;
    atGoal: number;
    goalRate: number;
  };
};

// GameStatistics contains metrics for a game (essentially a single set, not multiple)
export type GameStatistics = {
  left: {
    goals: number;
    atGoal: number;
    bars: TeamStatistics;
  };
  right: {
    goals: number;
    atGoal: number;
    bars: TeamStatistics;
  };
};

// rateFn takes a list of events and returns the percentage
// of events that match the predicate function
export const rateFn = (
  events: GameEvent[],
  from: EventType[],
  filterFn: EventFilter,
  pred: EventTypePredicate
): number => {
  const successful = filterFn(events, from, pred).length;
  const notSuccessful = filterFn(events, from, not(pred)).length;
  if (successful + notSuccessful == 0) {
    return 0;
  }
  return (successful / (successful + notSuccessful)) * 100;
};

export const getTeamStatistics = (
  team: string,
  events: GameEvent[]
): TeamStatistics => {
  const lookupTeamEvent = lookup(team);
  const enemyTeam = team == "L" ? isRight() : isLeft();
  const defense = lookupTeamEvent("DEFENSE");
  const offense = lookupTeamEvent("OFFENSE");
  const mid = lookupTeamEvent("MID");
  const goal = lookupTeamEvent("GOAL");
  const atGoal = lookupTeamEvent("AT_GOAL");
  const stats = {
    defense: {
      retry: hasPrev(events, [defense], includes([defense])).length,
      loss: hasNext(events, [defense], enemyTeam).length,
      goal: hasPrev(events, [goal], includes([defense])).length,
      atGoal: hasPrev(events, [atGoal], includes([defense])).length,
      pass: hasPrev(events, [offense], includes([defense])).length
    },
    mid: {
      retry: hasPrev(events, [mid], includes([mid])).length,
      loss: hasNext(events, [mid], enemyTeam).length,
      goal: hasPrev(events, [goal], includes([mid])).length,
      atGoal: hasPrev(events, [atGoal], includes([mid])).length,
      pass: hasPrev(events, [offense], includes([mid])).length,
      passRate: rateFn(
        removeEventSequence(events, [mid, goal]),
        [mid],
        hasNext,
        includes([offense])
      )
    },
    offense: {
      retry: hasPrev(events, [offense], includes([offense])).length,
      loss: hasNext(events, [offense], enemyTeam).length,
      lossRate: rateFn(events, [offense], hasNext, enemyTeam),
      goal: hasPrev(events, [goal], includes([offense])).length,
      atGoal: hasPrev(events, [atGoal], includes([offense])).length,
      goalRate: rateFn(events, [offense], hasNext, includes([goal]))
    }
  };

  return stats;
};

//
export const getStatistics = (events: GameEvent[]): GameStatistics => {
  const nonTimeoutEvents = events.filter(
    notTypes([TYPE_L_TIMEOUT, TYPE_R_TIMEOUT])
  );
  const leftBar = getTeamStatistics("L", nonTimeoutEvents);
  const rightBar = getTeamStatistics("R", nonTimeoutEvents);

  return {
    left: {
      goals: nonTimeoutEvents.filter(getType(TYPE_L_GOAL)).length,
      atGoal: nonTimeoutEvents.filter(getType(TYPE_L_AT_GOAL)).length,
      bars: leftBar
    },
    right: {
      goals: nonTimeoutEvents.filter(getType(TYPE_R_GOAL)).length,
      atGoal: nonTimeoutEvents.filter(getType(TYPE_R_AT_GOAL)).length,
      bars: rightBar
    }
  };
};

export const mapBarStats = (team: string, events: GameEvent[]) => {
  const look = lookup(team);
  const inverseTeam = team == "L" ? isRight() : isLeft();
  const midEvents = {} as any;
  const offenseEvents = {} as any;
  const defenseEvents = {} as any;
  const out = [] as any;

  events.forEach((e, i, coll) => {
    if (i >= coll.length - 1) {
      return;
    }
    const type = e.type.toString();
    const nextType = coll[i + 1].type;
    const next = getEventName(coll[i + 1].type);
    let nextName = next.replace(`TYPE_${team}_`, "");
    if (inverseTeam(nextType)) {
      nextName = "LOSS";
    }
    switch (type) {
      case look("MID"):
        if (!midEvents[nextName]) {
          midEvents[nextName] = 0;
        }
        midEvents[nextName]++;
        break;
      case look("OFFENSE"):
        if (!offenseEvents[nextName]) {
          offenseEvents[nextName] = 0;
        }
        offenseEvents[nextName]++;
        break;
      case look("DEFENSE"):
        if (!defenseEvents[nextName]) {
          defenseEvents[nextName] = 0;
        }
        defenseEvents[nextName]++;
        break;
      default:
        break;
    }
  });
  Object.keys(defenseEvents).forEach(k => {
    out.push({
      group: "DEFENSE",
      variable: k,
      value: defenseEvents[k]
    });
  });
  Object.keys(midEvents).forEach(k => {
    out.push({
      group: "MID",
      variable: k,
      value: midEvents[k]
    });
  });
  Object.keys(offenseEvents).forEach(k => {
    out.push({
      group: "OFFENSE",
      variable: k,
      value: offenseEvents[k]
    });
  });

  return out;
};
