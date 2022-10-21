import isEqual from "lodash.isequal";

export function ensureValuesEqual<T>(actual: T, expected: T, message: string) {
  if (!isEqual(actual, expected)) {
    throw new Error(`${message} : actual: '${actual}' expected: ${expected}`);
  }
}

export function shallowEquals<T extends {}, PT extends {}>(
  obj: T,
  partial: PT
): obj is T & PT {
  for (const [name, value] of Object.entries(partial)) {
    if (obj[name as keyof T] !== value) {
      return false;
    }
  }
  return true;
}

export function someShallowEquals<T extends {}, PTArray extends Partial<T>[]>(
  obj: T,
  ...partialArray: PTArray
): obj is T & PTArray[number] {
  for (const partial of partialArray) {
    if (shallowEquals(obj, partial)) {
      return true;
    }
  }
  return false;
}
