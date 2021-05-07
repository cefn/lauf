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
    const { events } = tracker.trackerStore.read();
    expect(events.length).toBe(10);
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
    const { events } = tracker.trackerStore.read();
    expect(events.length).toBe(14);
  });

  test("Actions, Reactions, State changes are recorded in tracker", async () => {
    //Configure, track and run plan
    const store = new BasicStore<State>({ counter: 0 });
    const tracker = new Tracker(store);
    await tracker.performPlan(countPlan, store);

    //Check basic number of events is as expected
    const { events } = tracker.trackerStore.read();
    expect(events.length).toBe(10);

    let pos = 0,
      event;

    /** First event records initial state */
    event = events[pos++] as StoreEvent<State>;
    expect(event.store).toBe(store);
    expect(event.state).toEqual({
      counter: 0,
    });

    //Each edit triggers a sequence of events:
    for (const newValue of [3, 4, 5]) {
      /** First the edit is instructed. */
      event = events[pos++] as ActionEvent<any, any, any>;
      assert(event.action instanceof Call);
      expect(event.action.fn).toBe(store.edit);
      const actionEvent = event;

      /** As part of edit operation the new state is notified  */
      event = events[pos++] as StoreEvent<State>;
      expect(event.store).toBe(store);
      expect(event.state).toEqual({
        counter: newValue,
      });

      /** Finally the edit instruction returns */
      event = events[pos++] as ReactionEvent<any, any, any>;
      expect(event.actionEvent).toBe(actionEvent); //the previous action event
      expect(event.reaction).toEqual({
        counter: newValue,
      });
    }

    //Events end
    expect(pos).toBe(events.length);
  });

  // test("", () => {});
});
