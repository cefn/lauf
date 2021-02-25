import { BasicMessageQueue } from "@lauf/lauf-queue";
import { Action, ActionClass } from "@lauf/lauf-runner";
import {
  perform,
  SyncRoutine,
  AsyncRoutine,
  Routine,
  Performer,
  actor,
} from "@lauf/lauf-runner-trial";
import { BasicStore } from "@lauf/lauf-store";
import { EditValue } from "@lauf/lauf-store-runner";
import { Receive } from "@lauf/lauf-store-runner/queue";

import {
  mainScript,
  fetchScript,
  FetchSubreddit,
  focusSelector,
  focusedCacheSelector,
  triggerFocus,
  triggerFetchFocused,
  AppState,
  initialAppState,
} from "../src/plans";

interface ActionMatch<ExpectedClass extends ActionClass<any[], any>> {
  actionClass: ExpectedClass;
  actionProps?: {
    [K in string]: any;
  };
}

function actionMatches<Actual extends Action<any>, Expected extends Actual>(
  actual: Actual,
  expected: Expected
): actual is Expected {
  // todo test excess properties (in 'actual' not in 'expected') ?
  if (actual.constructor !== expected.constructor) {
    return false;
  }
  const expectedNames = Object.getOwnPropertyNames(expected);
  for (const name of expectedNames) {
    if (!(name in actual)) {
      return false;
    }
    if ((actual as any)[name] !== (expected as any)[name]) {
      return false;
    }
  }
  return true;
}

type ActionExpectation<Reaction = any> = (actual: Action<Reaction>) => boolean;

function beginPerformance<Reaction, Return>(
  performer: Performer<Reaction, Return>
): AsyncRoutine<Reaction, Return> {
  const routine = performer();
  routine.next();
  return routine;
}

async function* performUntil<Reaction = any>(
  trigger: Reaction,
  expectation: ActionExpectation<Reaction>,
  performer: Performer<Reaction> = actor
): AsyncRoutine<Reaction, Action<Reaction>> {
  const routine = beginPerformance(performer);
  let action: Action<Reaction>;
  let reaction = trigger;
  while (true) {
    action = yield reaction;
    if (expectation(action)) {
      return action;
    } else {
      ({ value: reaction } = await routine.next(action));
    }
  }
}

/** Performs until matching action, performs the action, returns the subsequent action */
async function* performUntilAfter<Reaction = any>(
  trigger: Reaction,
  expectation: ActionExpectation<Reaction>,
  performer: Performer<Reaction> = actor
): AsyncRoutine<Reaction, Action<Reaction>> {
  const action = yield* performUntil(trigger, expectation, performer);
  const routine = beginPerformance(performer);
  const { value: reaction } = await routine.next(action);
  return yield reaction;
}

function createMatcher<Reaction = any>(expected: Action<Reaction>) {
  return (actual: Action<Reaction>) => actionMatches(actual, expected);
}

describe("Test domain logic", () => {
  describe("Main script", () => {
    test("Check behaviour", async () => {
      const store = new BasicStore<AppState>(initialAppState);
      async function* testPerformer(): AsyncRoutine<any, void> {
        let action;
        action = yield* performUntil(
          undefined, //no reaction, yet
          createMatcher(new FetchSubreddit(initialAppState.focus))
        );
        //mock the reaction
        const postsRetrieved = [
          { title: "FakeTitle" },
          { title: "DummyTitle" },
        ];
        action = performUntilAfter(
          postsRetrieved,
          (actual: Action<any>) => actual instanceof EditValue
        );
        expect(store.getValue().caches[initialAppState.focus]).toMatchObject(
          postsRetrieved
        );
      }
      perform(mainScript(store), testPerformer);
    });
  });

  // describe("Fetch script", () => {
  //   test("", () => {});
  // });
});
