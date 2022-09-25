import { promiseExpiry, Expiry, EXPIRY } from "./delay";
import { Action, ActionPlan, ActionSequence } from "../types";
import { planOfAction, performPlan } from "./util";

// type Mapped<Ending, T extends ActionSequence<Ending>[]> = {
//   [K in keyof T]: Promise<Ending>;
// } & { length: T["length"] };

export class BackgroundPlan<Args extends any[], Ending, Reaction>
  implements Action<readonly [Promise<Ending>]>
{
  readonly args: Args;
  constructor(
    readonly plan: ActionPlan<Args, Ending, Reaction>,
    ...args: Args
  ) {
    this.args = args;
  }
  act() {
    return [performPlan(this.plan, ...this.args)] as const;
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
): Promise<readonly [Ending, Promise<Ending>]> {
  return Promise.race(
    competingPromises.map(async (promise) => {
      const result = await promise;
      return [result, promise] as const;
    })
  );
}

export class RaceWait<Ending>
  implements Action<readonly [Ending, Promise<Ending>]>
{
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
export const backgroundPlan = planOfAction(BackgroundPlan);

/** Block on promises. */
export const wait = planOfAction(Wait);
export const raceWait = planOfAction(RaceWait);
export const teamWait = planOfAction(TeamWait);
export const timeoutWait = planOfAction(TimeoutWait);
