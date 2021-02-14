import { Store, BasicStore } from "@lauf/lauf-store";

import {
  getStorePath,
  setStorePath,
  setStorePathMap,
} from "@lauf/lauf-store/core/path";

describe("Store operations using paths", () => {
  test("getStorePath retrieves an array index path", () => {
    type X = { poem: Array<string> };
    const store: Store<X> = new BasicStore<X>({ poem: ["Roses are red"] });
    expect(getStorePath(store, "poem[0]")).toEqual("Roses are red");
  });

  test("setStorePath can set a map property path", () => {
    type X = { poem: Record<string, string> };
    const store: Store<X> = new BasicStore<X>({ poem: { roses: "red" } });
    setStorePath(store, "poem.roses", "white");
    expect(store.getValue()).toEqual({ poem: { roses: "white" } });
  });

  test("setStorePath can set an array index path", () => {
    type X = { poem: Array<string> };
    const store: Store<X> = new BasicStore<X>({ poem: ["Roses are red"] });
    setStorePath(store, "poem[0]", "Roses are white");
    expect(store.getValue()).toEqual({ poem: ["Roses are white"] });
  });

  test("setStorePaths can set multiple paths", () => {
    type X = { poem: Record<string, string> };
    const store: Store<X> = new BasicStore<X>({
      poem: { roses: "red", violets: "blue" },
    });
    setStorePathMap(store, {
      "poem.roses": "white",
      "poem.violets": "green",
    });
    expect(store.getValue()).toEqual({
      poem: { roses: "white", violets: "green" },
    });
  });
});
