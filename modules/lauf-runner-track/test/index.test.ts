import assert from "assert";
import {
  ActionSequence,
  ACTOR,
  backgroundPlan,
  Call,
  call,
  wait,
} from "@lauf/lauf-runner";
import { BasicStore, Store } from "@lauf/lauf-store";
import { Tracker, ActionEvent, ReactionEvent, StoreEvent } from "../src";

describe("Track actions and reactions from running sequences", () => {
  /** Introduce minimal Store state and plans for testing */

  interface State {
    counter: number;
  }

  function* countPlan(store: Store<State>): ActionSequence<void, any> {
    for (const i of [3, 4, 5]) {
      yield* call(store.edit, (state) => {
        state.counter = i;
      });
    }
  }

  function* forkingCountPlan(store: Store<State>): ActionSequence<void, any> {
    const [countPromise] = yield* backgroundPlan(countPlan, store);
    yield* wait(countPromise);
  }

  test("Actions and Reactions are performed as usual : single plan", async () => {
    //Configure, track and run plan
    const store = new BasicStore<State>({ counter: 0 });
    const tracker = new Tracker(store, ACTOR);
    await tracker.performPlan(countPlan, store);
    //Check end result is as normal
    expect(store.read()).toEqual({ counter: 5 });
    //Check basic number of events is as expected
    const { nextEventOrdinal } = tracker.trackerStore.read();
    expect(nextEventOrdinal).toBe(10);
  });

  test("Actions and Reactions are performed as usual : forked plan", async () => {
    //Configure, track and run plan
    const store = new BasicStore<State>({ counter: 0 });
    const tracker = new Tracker(store);
    await tracker.performPlan(forkingCountPlan, store);
    //Check end result is as normal
    expect(store.read()).toEqual({ counter: 5 });
    //Extra 4 events in forked plan are from
    //backgroundPlan,wait (each having Action,Reaction)
    const { nextEventOrdinal } = tracker.trackerStore.read();
    expect(nextEventOrdinal).toBe(14);
  });

  //TODO re-write remainder of this test

  test("Actions, Reactions, State changes are recorded in tracker", async () => {
    //Configure, track and run plan
    const store = new BasicStore<State>({ counter: 0 });
    const tracker = new Tracker(store);
    await tracker.performPlan(countPlan, store);

    const state = tracker.trackerStore.read();

    //Check basic number of events is as expected
    const { nextEventOrdinal, storeEvents } = state;
    expect(nextEventOrdinal).toBe(10);

    const forkHandle = state.forkHandles["0-countPlan"]!;
    const { actionEvents, reactionEvents } = forkHandle;

    let sPos = 0,
      storeEvent;
    let aPos = 0,
      actionEvent;
    let rPos = 0,
      reactionEvent;

    /** First event records initial state */
    storeEvent = storeEvents[sPos++] as StoreEvent<State>;
    expect(storeEvent.store).toBe(store);
    expect(storeEvent.state).toEqual({
      counter: 0,
    });

    //Each edit triggers a sequence of events:
    for (const newValue of [3, 4, 5]) {
      /** First the edit is instructed. */
      actionEvent = actionEvents[aPos++] as ActionEvent<any, any, any>;
      assert(actionEvent.action instanceof Call);
      expect(actionEvent.action.fn).toBe(store.edit);

      /** As part of edit operation the new state is notified  */
      storeEvent = storeEvents[sPos++] as StoreEvent<State>;
      expect(storeEvent.store).toBe(store);
      expect(storeEvent.state).toEqual({
        counter: newValue,
      });

      /** Finally the edit instruction returns */
      reactionEvent = reactionEvents[rPos++] as ReactionEvent<any, any, any>;
      expect(reactionEvent.actionEvent).toBe(actionEvent); //the previous action event
      expect(reactionEvent.reaction).toEqual({
        counter: newValue,
      });
    }

    // //Events end
    expect(sPos).toBe(storeEvents.length);
    expect(aPos).toBe(actionEvents.length);
    expect(rPos).toBe(reactionEvents.length);
  });

  // test("", () => {});
});
