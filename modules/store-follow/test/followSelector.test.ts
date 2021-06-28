import { createStore, Immutable, Store } from "@lauf/store";
import { Controls, followSelector } from "@lauf/store-follow";

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

describe("followSelector behaviour", () => {
  test("followSelector", async () => {
    const store = createStore(INITIAL_STATE);
    const spy = jest.fn();

    await followSelector(
      store,
      (state) => state.near,
      async (location, controls) => {
        spy(location);
      }
    );
  });
});
