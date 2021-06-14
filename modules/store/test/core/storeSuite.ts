import { Immutable, RootState, Store, Watcher } from "@lauf/store/src";
import { createDeferredMock } from "../util";

/** Defining a factory allows us to run the same test suite across stores and  partitioned stores. */
// eslint-disable-next-line jest/no-export
export type StoreFactory = <State extends RootState>(
  state: Immutable<State>,
  watchers?: ReadonlyArray<Watcher<State>>
) => Store<State>;

// eslint-disable-next-line jest/no-export
export function createStoreSuite(
  suiteName: string,
  storeFactory: StoreFactory
) {
  describe(`${suiteName}: Core behaviour`, () => {
    test("Create Store with list root", () => {
      const state = [3, 4, 5];
      expect(storeFactory<number[]>(state).read()).toEqual(state);
    });

    test("Create Store with map root", () => {
      const state = { pi: 3.1415926 };
      expect(storeFactory<Record<string, number>>(state).read()).toEqual(state);
    });

    test("Create Store and pass watchers who are notified", async () => {
      type State = Record<string, number>;
      const state: State = { pi: 3.1415926 };
      const { deferredResolve, deferred } = createDeferredMock<State>();
      const watchers = [deferredResolve] as const;
      storeFactory(state, watchers);
      expect(await deferred).toBe(state);
    });

    test("Can edit Store state", () => {
      const store = storeFactory<Record<string, string[]>>({
        ancient: ["Roses are red", "Violets are blue"],
      });
      const state = store.edit((draft) => {
        draft.modern = ["Sugar is sweet", "So are you"];
      });
      expect(state).toEqual({
        ancient: ["Roses are red", "Violets are blue"],
        modern: ["Sugar is sweet", "So are you"],
      });
    });

    test("Watchers notified of edits", async () => {
      type State = Record<string, string[]>;
      const { deferred, deferredResolve } = createDeferredMock<
        Immutable<State>
      >();
      const store = storeFactory<State>({
        ancient: ["Roses are red", "Violets are blue"],
      });
      store.watch(deferredResolve);
      const nextState = store.edit((draft) => {
        draft.modern = ["Sugar is sweet", "So are you"];
      });
      expect(nextState).toEqual({
        ancient: ["Roses are red", "Violets are blue"],
        modern: ["Sugar is sweet", "So are you"],
      });
      expect(await deferred).toBe(nextState);
    });

    test("Editing replaces only ancestor objects containing a change", () => {
      const store = storeFactory({
        ancient: ["Roses are red", "Violets are blue"],
        modern: ["Sugar is sweet", "So are you"],
      });
      const stateBefore = store.read();
      store.edit((draft) => {
        draft.ancient[0] = "Roses are white";
      });
      const stateAfter = store.read();
      expect(Object.is(stateBefore, stateAfter)).toBe(false);
      expect(
        [
          stateBefore.ancient,
          stateAfter.ancient,
          stateBefore.ancient,
          stateAfter.ancient,
        ].every((item) => Array.isArray(item))
      ).toBe(true);
      expect(Object.is(stateBefore.ancient, stateAfter.ancient)).toBe(false);
      expect(Object.is(stateBefore.modern, stateAfter.modern)).toBe(true);
    });
  });
}
