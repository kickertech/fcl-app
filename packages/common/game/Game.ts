import {
  GameEvent,
  getType,
  TYPE_L_GOAL,
  TYPE_R_GOAL,
  TYPE_START,
  TYPE_END,
} from "./GameEvents";

import { v4 as uuidv4 } from "uuid";
import _ from "lodash";
import { getStatistics } from "./Statistics";
import { Set } from "./Set";

export type GameResult = {
  leftGoals: number;
  rightGoals: number;
};

export type GAME_STATE = number;
export const GAME_STATE_NOT_STARTED: GAME_STATE = 0;
export const GAME_STATE_IN_PROGRESS: GAME_STATE = 1;
export const GAME_STATE_ENDED: GAME_STATE = 2;

export default class Game {
  id = "";
  leftTeam = "";
  rightTeam = "";
  sets = [new Set()];
  setIdx = 0;
  state = GAME_STATE_NOT_STARTED as GAME_STATE;

  constructor(
    id = uuidv4(),
    leftTeam: string,
    rightTeam: string,
    sets = [new Set()],
    state = GAME_STATE_NOT_STARTED
  ) {
    this.id = id;
    this.leftTeam = leftTeam;
    this.rightTeam = rightTeam;
    this.sets = sets;
    this.state = state;
  }

  update(game: Game): void {
    this.id = game.id;
    this.leftTeam = game.leftTeam;
    this.rightTeam = game.rightTeam;
    this.sets = game.sets;
    this.state = game.state;
  }

  undo(): GameEvent | undefined {
    return this.sets[this.setIdx].undo();
  }

  pushEvent(evt: GameEvent) {
    if (evt.type == TYPE_START && this.sets[this.setIdx].finished()) {
      this.state = GAME_STATE_IN_PROGRESS;
    } else if (evt.type == TYPE_END) {
      this.state = GAME_STATE_ENDED;
    }

    if (evt.type == TYPE_START && this.sets[this.setIdx].finished()) {
      ++this.setIdx;
      this.sets[this.setIdx] = new Set();
    }
    this.sets[this.setIdx].pushEvent(evt);
  }

  name(): string {
    return `${this.leftTeam} vs. ${this.rightTeam}`;
  }

  startTime(): number {
    return this.sets[0].startTime() || Date.now();
  }

  endTime(): number {
    return this.sets[this.sets.length - 1].endTime();
  }

  getCurrentSet() {
    return this.sets[this.setIdx];
  }

  getStatistics() {
    const allEvents = _.flatten(
      Object.keys(this.sets).map((i, n) => {
        return this.sets[n].events;
      })
    );
    return {
      total: getStatistics(allEvents),
      sets: this.sets.map((set) => getStatistics(set.events)),
    };
  }

  result(): GameResult {
    return {
      leftGoals: this.sets[0].events.filter(getType(TYPE_L_GOAL)).length,
      rightGoals: this.sets[0].events.filter(getType(TYPE_R_GOAL)).length,
    };
  }

  static fromJSON(obj: any): Game {
    if (!obj.sets || !obj.id || !obj.leftTeam || !obj.rightTeam) {
      throw new TypeError(`invalid game json: ${JSON.stringify(obj)}`);
    }
    return new Game(
      obj.id,
      obj.leftTeam,
      obj.rightTeam,
      obj.sets.map(
        (set: any) =>
          new Set(
            set.events.map((e: any) => new GameEvent(e.type, e.timestamp))
          )
      ),
      obj.state
    );
  }
}
