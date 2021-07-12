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

type Awaited<T> = T extends PromiseLike<infer U> ? Awaited<U> : T;

/** Races each of the named promises in `lookup`.
 * Returns an object containing a single, named result
 * for the first Promise that resolves.*/
export async function race<
  Key extends keyof any,
  Value,
  Lookup extends { [k in Key]: Promise<Value> }
>(lookup: Lookup) {
  return Promise.race(
    Object.entries(lookup).map(async ([key, promise]) => {
      const result = await promise;
      return { [key]: result };
    })
  ) as Promise<{ [k in Key]?: Awaited<Lookup[k]> }>;
}

// /** Proof of successful typing for doRace */
// async function testRace() {

//   const lookup = {
//     magicNumber: Promise.resolve(3),
//     magicWord: Promise.resolve("abracadabra"),
//   } as const;

//   const {magicNumber, magicWord} = await doRace(lookup);

//   if(magicNumber){
//     //it's a number
//     console.log(`${magicNumber}th char of bingo is ${"bingo".charAt(magicNumber)}`);
//   }
//   else if(magicWord){
//     // it's a string
//     console.log(`first char of word is ${magicWord.charAt(0)}`);
//   }
// }
