import { createStore, Immutable } from "@lauf/store";
import { withSelectorQueue } from "@lauf/store-follow";

import { manyTicks } from "./util";

interface Location {
  name: string;
  distance: number;
}

interface AppState {
  near: Location;
  far: Location;
}

const INITIAL_STATE: Immutable<AppState> = {
  near: { name: "London", distance: 100 },
  far: { name: "Sydney", distance: 10000 },
};

const timbuktu = {
  name: "Timbuktu",
  distance: 2000,
};
const beijing = {
  name: "Beijing",
  distance: 4000,
};
const manchester = {
  name: "Manchester",
  distance: 100,
};
const birmingham = {
  name: "Birmingham",
  distance: 100,
};

describe("withSelectorQueue behaviour", () => {
  test("withSelectorQueue passes a queue notifying selected changes", async () => {
    const store = createStore(INITIAL_STATE);

    const notified: Location[] = [];

    withSelectorQueue(
      store,
      (state) => state.near,
      async (queue, initialValue) => {
        let near = initialValue;
        while (true) {
          notified.push(near);
          near = await queue.receive();
        }
      }
    );
    store.edit((draft) => (draft.near = birmingham));
    store.edit((draft) => (draft.near = manchester));

    await manyTicks();
    expect(notified.length).toBe(3);
    expect(notified[0]).toBe(INITIAL_STATE.near);
    expect(notified[1]).toBe(birmingham);
    expect(notified[2]).toBe(manchester);
  });

  test("withSelectorQueue doesn't receive again when selected is identical", async () => {
    const store = createStore(INITIAL_STATE);

    const notified: Location[] = [];

    withSelectorQueue(
      store,
      (state) => state.near,
      async (queue, initialValue) => {
        let near = initialValue;
        while (true) {
          notified.push(near);
          near = await queue.receive();
        }
      }
    );
    store.edit((draft) => (draft.near = INITIAL_STATE.near));

    await manyTicks();
    expect(notified.length).toBe(1);
    expect(notified[0]).toBe(INITIAL_STATE.near);
  });

  test("withSelectorQueue queueHandler can return a value", async () => {
    const store = createStore(INITIAL_STATE);

    const notified: Location[] = [];

    const promiseEnding = withSelectorQueue(
      store,
      (state) => state.near,
      async (queue, initialValue) => {
        let near = initialValue;
        while (true) {
          notified.push(near);
          near = await queue.receive();
          if (near === manchester) {
            return manchester;
          }
        }
      }
    );

    store.edit((draft) => (draft.near = birmingham));
    store.edit((draft) => (draft.near = manchester));

    await manyTicks();
    expect(notified.length).toBe(2);
    expect(notified[0]).toBe(INITIAL_STATE.near);
    expect(notified[1]).toBe(birmingham);

    const ending = await promiseEnding;
    expect(ending).toBe(manchester);
  });
});
