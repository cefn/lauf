import { promiseDelay, Expiry } from "./delay";
import { Action, ActionPlan, ActionSequence } from "../types";
import { planOfAction, performPlan, performSequence } from "./util";

export class ForegroundPlan<Ending> implements Action<Ending> {
  constructor(readonly plan: ActionPlan<[], Ending>) {}
  async act() {
    return await performPlan(this.plan);
  }
}

export class ForegroundAllPlans<Ending> implements Action<Ending[]> {
  constructor(readonly plans: ActionPlan<[], Ending>[]) {}
  async act() {
    return await Promise.all(this.plans.map(performPlan));
  }
}

export class BackgroundAllPlans<Ending> implements Action<Promise<Ending>[]> {
  constructor(readonly plans: ActionPlan<[], Ending>[]) {}
  act() {
    return this.plans.map(performPlan);
  }
}

export class Race<Ending = any>
  implements Action<[Ending, ActionSequence<Ending>]> {
  constructor(readonly sequences: ActionSequence<Ending>[]) {}
  act() {
    return Promise.race(
      this.sequences.map(async (sequence) => {
        const result = await performSequence(sequence);
        const completion: [Ending, ActionSequence<Ending>] = [result, sequence];
        return completion;
      })
    );
  }
}

export class Team<Ending = any> implements Action<Ending[]> {
  constructor(readonly sequences: ActionSequence<Ending>[]) {}
  act() {
    return Promise.all(this.sequences.map(performSequence));
  }
}

class Timeout<Ending = any> implements Action<Ending | Expiry> {
  constructor(readonly sequence: ActionSequence<Ending>, readonly ms: number) {}
  act() {
    const completionPromise = performSequence(this.sequence);
    const timeoutPromise = promiseDelay(this.ms);
    return Promise.race([completionPromise, timeoutPromise]);
  }
}

class Wait<Ending = any> implements Action<Ending> {
  constructor(readonly promise: Promise<Ending>) {}
  act() {
    return this.promise;
  }
}

//TODO add a fork, which yields the promise of sequence completion (complement of join)

/** Spawn ActionPlans */
export const foregroundPlan = planOfAction(ForegroundPlan);
export const foregroundAllPlans = planOfAction(ForegroundAllPlans);
export const backgroundAllPlans = planOfAction(BackgroundAllPlans);

/** Compose ActionSequences */
export const race = planOfAction(Race);
export const team = planOfAction(Team);
export const timeout = planOfAction(Timeout);

/** Block on a promise. */
export const wait = planOfAction(Wait);
