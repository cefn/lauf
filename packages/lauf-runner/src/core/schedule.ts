import { promiseDelay, Expiry } from "../domain/delay";
import { Action, RootProcedure, Sequence } from "../types";
import {
  createActionProcedure,
  executeRootProcedure,
  executeSequence,
} from "./util";

export class Background<Outcome> implements Action<Outcome> {
  constructor(readonly procedure: RootProcedure<Outcome>) {}
  act() {
    return executeRootProcedure(this.procedure);
  }
}

export class BackgroundAll<Outcome> implements Action<Outcome[]> {
  constructor(readonly procedures: RootProcedure<Outcome>[]) {}
  act() {
    return Promise.all(this.procedures.map(executeRootProcedure));
  }
}

export class Foreground<Outcome> implements Action<Outcome> {
  constructor(readonly procedure: RootProcedure<Outcome>) {}
  async act() {
    return await executeRootProcedure(this.procedure);
  }
}

export class Join<Outcome> implements Action<Outcome> {
  constructor(readonly sequence: Sequence<Outcome>) {}
  act() {
    return executeSequence(this.sequence);
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
export const background = createActionProcedure(Background);
export const backgroundAll = createActionProcedure(BackgroundAll);

/** Compose sequences */
export const join = createActionProcedure(Join);
export const race = createActionProcedure(Race);
export const team = createActionProcedure(Team);
export const timeout = createActionProcedure(Timeout);

/** Block on a promise. */
export const wait = createActionProcedure(Wait);
