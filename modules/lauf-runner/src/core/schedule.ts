import { promiseExpiry, Expiry, EXPIRY } from "./delay";
import { Action, ActionPlan, ActionSequence, Performer } from "../types";
import { planOfAction, directPlan, ACTOR } from "./util";

type BackgroundEnding<T> = readonly [Promise<T>];

// type Mapped<Ending, T extends ActionSequence<Ending>[]> = {
//   [K in keyof T]: Promise<Ending>;
// } & { length: T["length"] };

export class BackgroundPlan<Args extends any[], Ending, Reaction>
  implements Action<readonly [Promise<Ending>]> {
  constructor(
    readonly plan: ActionPlan<Args, Ending, Reaction>,
    readonly args: Args,
    readonly performer: Performer = ACTOR
  ) {}
  act() {
    return [directPlan(this.plan, this.args, this.performer)] as const;
  }
}

class Wait<Ending> implements Action<Ending> {
  constructor(readonly promise: Promise<Ending>) {}
  act() {
    return this.promise;
  }
}

function promiseWin<Ending>(
  competingPromises: Promise<Ending>[]
): Promise<[Ending, Promise<Ending>]> {
  return Promise.race(
    competingPromises.map(async (promise) => {
      const result = await promise;
      return [result, promise];
    })
  );
}

export class RaceWait<Ending> implements Action<[Ending, Promise<Ending>]> {
  constructor(readonly promises: Promise<Ending>[]) {}
  act() {
    return promiseWin(this.promises);
  }
}

export class TeamWait<Ending> implements Action<Ending[]> {
  constructor(readonly promises: Promise<Ending>[]) {}
  act() {
    return Promise.all(this.promises);
  }
}

class TimeoutWait<Ending> implements Action<Ending | Expiry> {
  constructor(readonly promise: Promise<Ending>, readonly ms: number) {}
  async act() {
    const [ending, winner] = await promiseWin<Ending | Expiry>([
      this.promise,
      promiseExpiry(this.ms),
    ]);
    if (winner === this.promise) {
      return ending;
    } else {
      //TODO throw here? simpler in ActionPlan code compared to guards?
      return EXPIRY;
    }
  }
}

export function* backgroundAllPlans<Ending, Reaction>(
  plans: ActionPlan<[], Ending, Reaction>[]
): ActionSequence<Promise<Ending>[], any> {
  //Is reaction type `any` a dangerous hack?
  const promises: Promise<Ending>[] = [];
  for (const plan of plans) {
    const [promise] = yield* backgroundPlan(plan);
    promises.push(promise);
  }
  return promises;
}

/** Background sequences returning promises */
export const backgroundPlan = function* <Args extends any[], Ending, Reaction>(
  plan: ActionPlan<Args, Ending, Reaction>,
  ...args: Args
): ActionSequence<BackgroundEnding<Ending>, BackgroundEnding<Ending>> {
  return yield new BackgroundPlan(plan, args);
};

/** Block on promises. */
export const wait = planOfAction(Wait);
export const raceWait = planOfAction(RaceWait);
export const teamWait = planOfAction(TeamWait);
export const timeoutWait = planOfAction(TimeoutWait);
