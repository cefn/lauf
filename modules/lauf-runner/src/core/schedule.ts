import { promiseExpiry, Expiry, EXPIRY } from "./delay";
import { ActionPlan, ActionSequence, AnyFn, Termination } from "../types";
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

export function* backgroundAllPlans<Ending, Fn extends AnyFn>(
  plans: ActionPlan<[], Ending, Fn>[]
): ActionSequence<Promise<Ending | Termination>[], Fn> {
  //Is reaction type `any` a dangerous hack?
  const promises: Promise<Ending | Termination>[] = [];
  for (const plan of plans) {
    const [promise] = yield* backgroundPlan(plan);
    promises.push(promise);
  }
  return promises;
}

/** Background sequences returning promises */
export const backgroundPlan = planOfFunction(
  async <Args extends any[], Ending, Fn extends AnyFn>(
    plan: ActionPlan<Args, Ending, Fn>,
    ...args: Args
  ): Promise<readonly [Promise<Termination | Ending>]> => {
    const endingPromise = performPlan(plan, ...args);
    return [endingPromise] as const;
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
