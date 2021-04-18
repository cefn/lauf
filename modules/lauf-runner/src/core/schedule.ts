import { promiseExpiry, Expiry, EXPIRY } from "./delay";
import { ActionPlan, ActionSequence, Termination } from "../types";
import { performPlan, planOfFunction } from "./util";

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

export function* backgroundAllPlans<Ending, Reaction, ActionArgs extends any[]>(
  plans: ActionPlan<Ending, [], Reaction, ActionArgs>[]
): ActionSequence<
  Promise<Ending | Termination>[], //aggregated list
  readonly [Promise<Ending | Termination>], //reactions from backgroundPlan
  [typeof plans[number]] //arguments to backgroundPlan
> {
  const promises: Promise<Ending | Termination>[] = [];
  for (const plan of plans) {
    const [promise] = yield* backgroundPlan(plan);
    promises.push(promise);
  }
  return promises;
}

/** Background sequences returning promises */
export const backgroundPlan = planOfFunction(
  async <Ending, PlanArgs extends any[], Reaction, ActionArgs extends any[]>(
    plan: ActionPlan<Ending, PlanArgs, Reaction, ActionArgs>,
    ...args: PlanArgs
  ): Promise<readonly [Promise<Termination | Ending>]> => {
    return [performPlan(plan, ...args)] as const;
  }
);

/** Block on promises. */
export const wait = planOfFunction(async (promise) => await promise);

export const raceWait = planOfFunction(promiseWin);

export const teamWait = planOfFunction(
  async <Ending>(promises: Promise<Ending>[]) => {
    return await Promise.all(promises);
  }
);

export const timeoutWait = planOfFunction(
  async <Ending>(promise: Promise<Ending>, ms: number) => {
    const [ending, winner] = await promiseWin<Ending | Expiry>([
      promise,
      promiseExpiry(ms),
    ]);
    if (winner === promise) {
      return ending;
    } else {
      //TODO throw here? simpler in ActionPlan code compared to guards?
      return EXPIRY;
    }
  }
);
