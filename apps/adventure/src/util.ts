/** The set of keys that map to a specific value type in T */
export type KeyFor<T, ValueType> =
  // force a 'distributive conditional' over keyof T
  keyof T extends keyof T
    ? //check mapped value is of value type
      T[keyof T] extends ValueType
      ? keyof T // pass through the key
      : never // exclude the key
    : never; // unused never (from 'forced' distributive conditional)

/** Keys that map to boolean in T */
export type BooleanKeys<T> = KeyFor<T, boolean>;
