import assert from "assert";
import { BasicStore, Store } from "@lauf/lauf-store";
import { setStorePath, SetStorePath } from "@lauf/lauf-runner-primitives";
import { ForkRegistry } from "../src/fork";

type Poem = {
  roses?: "red";
  violets?: "blue";
  sugar?: "sweet";
  so?: "you";
};

function* setLine<K extends keyof Poem>(
  store: Store<Poem>,
  key: K,
  value: Poem[K]
) {
  yield* setStorePath(store, key, value);
}

function* poemPlan(store: Store<Poem>) {
  yield* setLine(store, "roses", "red");
  yield* setLine(store, "violets", "blue");
  yield* setLine(store, "sugar", "sweet");
  yield* setLine(store, "so", "you");
}

test("ActionPlans can be run by a ForkRegistry", async () => {
  //run the plan
  const store = new BasicStore<Poem>({});
  const registry = new ForkRegistry(store);
  await registry.watchPlan(poemPlan, [store]);

  //check intercepted data from the run

  expect(store.read()).toEqual({
    roses: "red",
    violets: "blue",
    sugar: "sweet",
    so: "you",
  });

  Object.entries(registry.forkHandles).map(([forkId, forkHandle]) => {
    //id is allocated based on plan function name
    expect(forkId).toBe("0-poemPlan");
    //4 action phases are recorded
    expect(forkHandle.actionPhases.length).toBe(4);
    expect(forkHandle.reactionPhases.length).toBe(4);
    //content of each action phase matches action
    forkHandle.actionPhases.map((actionPhase, actionIndex) => {
      const { eventId, prevState, action } = actionPhase;
      expect(eventId).toBe(actionIndex * 2); //an action event and reaction event for each
      expect(Object.keys(prevState).length).toBe(actionIndex);
      assert(action instanceof SetStorePath);
      expect(action.store).toBe(store);
      switch (actionIndex) {
        case 0:
          expect(prevState).toEqual({});
          expect(action.path).toBe("roses");
          expect(action.value).toBe("red");
          break;
        case 1:
          expect(prevState).toEqual({ roses: "red" });
          expect(action.path).toBe("violets");
          expect(action.value).toBe("blue");
          break;
        case 2:
          expect(prevState).toEqual({ roses: "red", violets: "blue" });
          expect(action.path).toBe("sugar");
          expect(action.value).toBe("sweet");
          break;
        case 3:
          expect(prevState).toEqual({
            roses: "red",
            violets: "blue",
            sugar: "sweet",
          });
          expect(action.path).toBe("so");
          expect(action.value).toBe("you");
          break;
        default:
          throw new Error(`Unexpected actionIndex ${actionIndex}`);
      }
    });
  });
});
