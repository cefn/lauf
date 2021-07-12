export const EXPIRY = Symbol("expiry");
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

export async function raceKeys<
  Lookup extends { [k in string]: Promise<unknown> }
>(lookup: Lookup): Promise<keyof Lookup> {
  return Promise.race(
    Object.entries(lookup).map(async ([key, promise]) => {
      await promise;
      return key;
    })
  );
}
