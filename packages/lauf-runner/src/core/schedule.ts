import { promiseDelay, Expiry } from "./delay";
import { Action, Script, Performance } from "../types";
import { createActionScript, stageScript, stagePerformance } from "./util";

export class ForegroundScript<Ending> implements Action<Ending> {
  constructor(readonly script: Script<[], Ending>) {}
  async act() {
    return await stageScript(this.script);
  }
}

export class ForegroundAllScripts<Ending> implements Action<Ending[]> {
  constructor(readonly scripts: Script<[], Ending>[]) {}
  async act() {
    return await Promise.all(this.scripts.map(stageScript));
  }
}

export class BackgroundAllScripts<Ending> implements Action<Promise<Ending>[]> {
  constructor(readonly scripts: Script<[], Ending>[]) {}
  act() {
    return this.scripts.map(stageScript);
  }
}

export class Race<Ending = any>
  implements Action<[Ending, Performance<Ending>]> {
  constructor(readonly performances: Performance<Ending>[]) {}
  act() {
    return Promise.race(
      this.performances.map(async (performance) => {
        const result = await stagePerformance(performance);
        const completion: [Ending, Performance<Ending>] = [result, performance];
        return completion;
      })
    );
  }
}

export class Team<Ending = any> implements Action<Ending[]> {
  constructor(readonly performances: Performance<Ending>[]) {}
  act() {
    return Promise.all(this.performances.map(stagePerformance));
  }
}

class Timeout<Ending = any> implements Action<Ending | Expiry> {
  constructor(
    readonly performances: Performance<Ending>,
    readonly ms: number
  ) {}
  act() {
    const completionPromise = stagePerformance(this.performances);
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

//TODO add a fork, which yields the promise of performance completion (complement of join)

/** Spawn scripts */
export const foregroundScript = createActionScript(ForegroundScript);
export const foregroundAllScripts = createActionScript(ForegroundAllScripts);
export const backgroundAllScripts = createActionScript(BackgroundAllScripts);

/** Compose performances */
export const race = createActionScript(Race);
export const team = createActionScript(Team);
export const timeout = createActionScript(Timeout);

/** Block on a promise. */
export const wait = createActionScript(Wait);
