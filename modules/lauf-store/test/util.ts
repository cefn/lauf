export function createDeferred<Result>() {
  type Resolve = (result: Result) => void;
  let deferredResolve: Resolve | null = null;
  const deferred = new Promise<Result>((resolve) => {
    deferredResolve = resolve;
  });
  return {
    // tell compiler about IIFE assignment ( https://github.com/microsoft/TypeScript/issues/11498 )
    deferredResolve: (deferredResolve as unknown) as Resolve,
    deferred,
  };
}
