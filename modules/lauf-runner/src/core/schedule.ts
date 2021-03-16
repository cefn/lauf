import { promiseDelay, Expiry, EXPIRY } from "./delay";
import { Action, ActionSequence } from "../types";
import { planOfAction, performSequence } from "./util";

// type Mapped<Ending, T extends ActionSequence<Ending>[]> = {
//   [K in keyof T]: Promise<Ending>;
// } & { length: T["length"] };

export class Background<Ending> implements Action<readonly [Promise<Ending>]> {
  constructor(readonly sequence: ActionSequence<Ending>) {}
  act() {
    return [performSequence(this.sequence)] as const;
  }
}

export class BackgroundAll<
  Ending,
  SequenceList extends ActionSequence<Ending>[]
> implements Action<Promise<Ending>[]> {
  constructor(readonly sequences: SequenceList) {}
  act(): Promise<Ending>[] {
    return this.sequences.map(performSequence);
  }
}

class Wait<Ending = any> implements Action<Ending> {
  constructor(readonly promise: Promise<Ending>) {}
  act() {
    return this.promise;
  }
}

export class RaceWait<Ending = any>
  implements Action<[Ending, Promise<Ending>]> {
  constructor(readonly promises: Promise<Ending>[]) {}
  act() {
    return Promise.race(
      this.promises.map(async (promise) => {
        const result = await promise;
        const completion: [Ending, Promise<Ending>] = [result, promise];
        return completion;
      })
    );
  }
}

export class TeamWait<Ending> implements Action<Ending[]> {
  constructor(readonly promises: Promise<Ending>[]) {}
  act() {
    return Promise.all(this.promises);
  }
}

class TimeoutWait<Ending> extends RaceWait implements Action<Ending | Expiry> {
  constructor(readonly promise: Promise<Ending>, readonly ms: number) {
    super([promise, promiseDelay(ms)]);
  }
  async act() {
    const [ending, winner] = await super.act();
    if (winner === this.promise) {
      return ending;
    } else {
      return EXPIRY;
    }
  }
}

/** Background sequences returning promises */
export const background = planOfAction(Background);
export const backgroundAll = planOfAction(BackgroundAll);

/** Block on promises. */
export const wait = planOfAction(Wait);
export const raceWait = planOfAction(RaceWait);
export const teamWait = planOfAction(TeamWait);
export const timeoutWait = planOfAction(TimeoutWait);
