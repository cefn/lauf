import assert from "assert";
import { BasicStore, Store } from "@lauf/lauf-store";
import { setStorePath, SetStorePath } from "@lauf/lauf-runner-primitives";
import { ForkRegistry } from "../src/fork";
import { backgroundPlan, wait } from "@lauf/lauf-runner/src";

type LovePoem = {
  roses?: "red";
  violets?: "blue";
  sugar?: "sweet";
  so?: "you";
};

type MicrobesPoem = {
  adam?: "'ad'em'";
};

function* setLine<
  Poem extends LovePoem | MicrobesPoem,
  K extends string & keyof Poem
>(store: Store<Poem>, key: K, value: Poem[K]) {
  yield* setStorePath(store, key, value);
}

function* lovePoemPlan(store: Store<LovePoem>) {
  yield* setLine(store, "roses", "red");
  yield* setLine(store, "violets", "blue");
  yield* setLine(store, "sugar", "sweet");
  yield* setLine(store, "so", "you");
}

function* microbesPoemPlan(store: Store<MicrobesPoem>) {
  yield* setLine(store, "adam", "'ad'em'");
}

test("ForkRegistry tracks concurrent plans spawned by a parent plan", async () => {
  //run the plan
  const store = new BasicStore<LovePoem>({});
  const registry = new ForkRegistry(store);
  await registry.watchPlan(lovePoemPlan, [store]);

  //check intercepted data from the run

  expect(store.read()).toEqual({
    roses: "red",
    violets: "blue",
    sugar: "sweet",
    so: "you",
  });

  Object.entries(registry.forkHandles).map(([forkId, forkHandle]) => {
    //id is allocated based on plan function name
    expect(forkId).toBe("0-lovePoemPlan");
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

test("ForkRegistry tracks concurrent plans spawned by a parent plan", async () => {
  //create a plan
  function* concurrentPoems(store: Store<LovePoem & MicrobesPoem>) {
    yield* wait(
      Promise.all([
        backgroundPlan(lovePoemPlan, [store]),
        backgroundPlan(microbesPoemPlan, [store]),
      ])
    );
  }
  //run the plan
  const store = new BasicStore<LovePoem & MicrobesPoem>({});
  const registry = new ForkRegistry(store);
  await registry.watchPlan(concurrentPoems, [store]);

  //check intercepted data from the run
  expect(store.read()).toEqual({
    roses: "red",
    violets: "blue",
    sugar: "sweet",
    so: "you",
    adam: "'ad'em",
  });

  const forkHandlesEntries = Object.entries(registry.forkHandles);
  //expect handle for main plan and two backgrounded plans
  expect(forkHandlesEntries.length).toBe(3);
});
