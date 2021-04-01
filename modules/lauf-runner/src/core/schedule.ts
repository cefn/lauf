import { promiseDelay, Expiry, EXPIRY } from "./delay";
import { Action, ActionPlan, ActionSequence } from "../types";
import { planOfAction, performPlan } from "./util";

// type Mapped<Ending, T extends ActionSequence<Ending>[]> = {
//   [K in keyof T]: Promise<Ending>;
// } & { length: T["length"] };

export class BackgroundPlan<Args extends any[], Ending>
  implements Action<readonly [Promise<Ending>]> {
  readonly args: Args;
  constructor(readonly plan: ActionPlan<Args, Ending>, ...args: Args) {
    this.args = args;
  }
  act() {
    return [performPlan(this.plan, ...this.args)] as const;
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

export function* backgroundAllPlans<Ending, Reaction>(
  plans: ActionPlan<[], Ending, Reaction>[]
): ActionSequence<Promise<Ending>[], Reaction> {
  const promises: Promise<Ending>[] = [];
  for (const plan of plans) {
    const [promise] = yield* backgroundPlan(plan);
    promises.push(promise);
  }
  return promises;
}

/** Background sequences returning promises */
export const backgroundPlan = planOfAction(BackgroundPlan);

/** Block on promises. */
export const wait = planOfAction(Wait);
export const raceWait = planOfAction(RaceWait);
export const teamWait = planOfAction(TeamWait);
export const timeoutWait = planOfAction(TimeoutWait);
