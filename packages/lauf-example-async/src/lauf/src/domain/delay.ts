import { Action, Expiry, EXPIRY } from "../types";
import { createActionProcedure } from "../util";

export function promiseDelay(ms: number): Promise<Expiry> {
  return new Promise((resolve) => setTimeout(resolve, ms, EXPIRY));
}

export class Delay implements Action<Expiry> {
  constructor(readonly ms: number) {}
  act() {
    return promiseDelay(this.ms);
  }
}

export const delay = createActionProcedure(Delay);
