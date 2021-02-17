import { Action } from "../types";
import { createActionScript } from "../core/util";

export const EXPIRY = ["expiry"] as const;
export type Expiry = typeof EXPIRY;
export function isExpiry(value: any): value is Expiry {
  return value === EXPIRY;
}

export function promiseDelay(ms: number): Promise<Expiry> {
  return new Promise((resolve) => setTimeout(resolve, ms, EXPIRY));
}

export class Delay implements Action<Expiry> {
  constructor(readonly ms: number) {}
  act() {
    return promiseDelay(this.ms);
  }
}

export const delay = createActionScript(Delay);
