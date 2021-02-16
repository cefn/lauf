import { promiseDelay, Expiry } from "../domain/delay";
import { Action, RootProcedure, Sequence } from "../types";
import {
  createActionProcedure,
  executeRootProcedure,
  executeSequence,
} from "./util";

export class Foreground<Outcome> implements Action<Outcome> {
  constructor(readonly procedure: RootProcedure<Outcome>) {}
  async act() {
    return await executeRootProcedure(this.procedure);
  }
}

export class ForegroundAll<Outcome> implements Action<Outcome[]> {
  constructor(readonly procedures: RootProcedure<Outcome>[]) {}
  async act() {
    return await Promise.all(this.procedures.map(executeRootProcedure));
  }
}

export class BackgroundAll<Outcome> implements Action<Promise<Outcome>[]> {
  constructor(readonly procedures: RootProcedure<Outcome>[]) {}
  act() {
    return this.procedures.map(executeRootProcedure);
  }
}

export class Race<Outcome = any>
  implements Action<[Outcome, Sequence<Outcome>]> {
  constructor(readonly sequences: Sequence<Outcome>[]) {}
  act() {
    return Promise.race(
      this.sequences.map(async (sequence) => {
        const result = await executeSequence(sequence);
        const completion: [Outcome, Sequence<Outcome>] = [result, sequence];
        return completion;
      })
    );
  }
}

export class Team<Outcome = any> implements Action<Outcome[]> {
  constructor(readonly sequences: Sequence<Outcome>[]) {}
  act() {
    return Promise.all(this.sequences.map(executeSequence));
  }
}

class Timeout<Outcome = any> implements Action<Outcome | Expiry> {
  constructor(readonly sequence: Sequence<Outcome>, readonly ms: number) {}
  act() {
    const sequencePromise = executeSequence(this.sequence);
    const timeoutPromise = promiseDelay(this.ms);
    return Promise.race([sequencePromise, timeoutPromise]);
  }
}

class Wait<Outcome = any> implements Action<Outcome> {
  constructor(readonly promise: Promise<Outcome>) {}
  act() {
    return this.promise;
  }
}

//TODO add a fork, which yields the promise of sequence completion (complement of join)

/** Spawn procedures */
export const foreground = createActionProcedure(Foreground);
export const foregroundAll = createActionProcedure(ForegroundAll);
export const backgroundAll = createActionProcedure(BackgroundAll);

/** Compose sequences */
export const race = createActionProcedure(Race);
export const team = createActionProcedure(Team);
export const timeout = createActionProcedure(Timeout);

/** Block on a promise. */
export const wait = createActionProcedure(Wait);
