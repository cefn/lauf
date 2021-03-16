import { performPlan } from "@lauf/lauf-runner";
import { Store, BasicStore } from "@lauf/lauf-store";
import {
  getStorePath,
  setStorePath,
  setStorePathMap,
} from "@lauf/lauf-runner-primitives";

describe("Store operations using paths", () => {
  test("getStorePath retrieves an array index path", async () => {
    type X = { poem: Array<string> };
    const store: Store<X> = new BasicStore<X>({ poem: ["Roses are red"] });
    const plan = function* () {
      return yield* getStorePath(store, "poem[0]");
    };
    const ending = await performPlan(plan);
    expect(ending).toStrictEqual("Roses are red");
  });

  test("setStorePath can set a map property path", async () => {
    type X = { poem: Record<string, string> };
    const store: Store<X> = new BasicStore<X>({ poem: { roses: "red" } });
    const plan = function* () {
      return yield* setStorePath(store, "poem.roses", "white");
    };
    const ending = await performPlan(plan);
    expect(ending).toStrictEqual(store.read());
    expect(store.read()).toEqual({ poem: { roses: "white" } });
  });

  test("setStorePath can set an array index path", async () => {
    type X = { poem: Array<string> };
    const store: Store<X> = new BasicStore<X>({ poem: ["Roses are red"] });
    const plan = function* () {
      return yield* setStorePath(store, "poem[0]", "Roses are white");
    };
    const ending = await performPlan(plan);
    expect(ending).toStrictEqual(store.read());
    expect(store.read()).toEqual({ poem: ["Roses are white"] });
  });

  test("setStorePathMap can set multiple paths", async () => {
    type X = { poem: Record<string, string> };
    const store: Store<X> = new BasicStore<X>({
      poem: { roses: "red", violets: "blue" },
    });
    const plan = function* () {
      return yield* setStorePathMap(store, {
        "poem.roses": "white",
        "poem.violets": "green",
      });
    };
    const ending = await performPlan(plan);
    expect(ending).toStrictEqual(store.read());
    expect(store.read()).toEqual({
      poem: { roses: "white", violets: "green" },
    });
  });
});
