import { planOfFunction } from "../core/util";

export const EXPIRY = ["expiry"] as const;
export type Expiry = typeof EXPIRY;
export function isExpiry(value: any): value is Expiry {
  return value === EXPIRY;
}

//TODO rename to promiseDelay after checking references to old promiseDelay are gone
export function promiseDelayValue<V>(ms: number, value: V): Promise<V> {
  return new Promise((resolve) => setTimeout(resolve, ms, value));
}

export function promiseExpiry(ms: number): Promise<Expiry> {
  return promiseDelayValue(ms, EXPIRY);
}

export const expire = planOfFunction(promiseExpiry);
