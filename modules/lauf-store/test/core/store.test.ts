import { BasicStore } from "@lauf/lauf-store";

describe("BasicStore behaviour", () => {
  test("Can create BasicStore with primitive root", () => {
    new BasicStore<string>("foo");
    new BasicStore<number>(42);
    new BasicStore<boolean>(true);
  });

  test("Can create BasicStore with list root", () => {
    new BasicStore<Array<number>>([3, 4, 5]);
  });

  test("Can create BasicStore with map root", () => {
    new BasicStore<Record<string, number>>({ pi: 3.1415926 });
  });

  test("Can edit BasicStore", () => {
    const store = new BasicStore<Record<string, string[]>>({
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

  test("Editing BasicStore replaces items iff on path to change", () => {
    const store = new BasicStore<Record<string, string[]>>({
      ancient: ["Roses are red", "Violets are blue"],
      modern: ["Sugar is sweet", "So are you"],
    });
    const stateBefore = store.read();
    store.edit((draft) => {
      draft.ancient = draft.ancient || [];
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
