import { isDeepStrictEqual } from "util";
import {
  Action,
  Performer,
  Performance,
  actor,
  isAction,
} from "@lauf/lauf-runner";

type ActionCheck = (candidate: Action<any>) => boolean;

function actionMatches<Actual extends Action<any>, Expected extends Actual>(
  actual: Actual,
  expected: Expected
): actual is Expected {
  return (
    actual.constructor === expected.constructor &&
    isDeepStrictEqual(actual, expected)
  );
}

export function createActionMatcher<Reaction>(expected: Action<Reaction>) {
  return (candidate: Action<Reaction>) => actionMatches(candidate, expected);
}

export async function* performUntilActionFulfils<Reaction>(
  action: Action<Reaction>,
  criterion: (candidate: Action<Reaction>) => boolean,
  performer: Performer<never, Reaction> = actor
): Performance<Action<Reaction>, Reaction> {
  const performance = performer(action);
  let { value: reaction, done } = await performance.next();
  while (!done) {
    const action = yield reaction;
    if (criterion(action)) {
      return action;
    }
    ({ value: reaction, done } = await performance.next(action));
  }
  throw `Performer with Exit:never should consume actions forever`;
}

export async function* performUntilReactionFulfils<Reaction>(
  action: Action<Reaction>,
  criterion: (candidate: Reaction) => boolean,
  performer: Performer<never, Reaction> = actor
): Performance<Reaction, Reaction> {
  const performance = performer(action);
  let { value: reaction, done } = await performance.next();
  while (!done) {
    const action = yield reaction;
    ({ value: reaction, done } = await performance.next(action));
    if (criterion(reaction)) {
      return reaction;
    }
  }
  throw `Performer with Exit:never should consume actions forever`;
}

export async function* performWithMocks<Reaction>(
  action: Action<Reaction>,
  mocks: Array<[ActionCheck | Action<any>, Reaction]>,
  performer: Performer<never, Reaction> = actor
): Performance<never, Reaction> {
  //substitute action 'checks' with a matcher for the action
  const normalisedMocks = mocks.map<[ActionCheck, Reaction]>(
    ([check, mocked]) => [
      isAction(check) ? createActionMatcher(check) : check,
      mocked,
    ]
  );
  //begin the actual performance
  const performance = performer(action);
  let { value: reaction, done } = await performance.next();
  while (!done) {
    const action = yield reaction;
    for (const [check, mocked] of normalisedMocks) {
      if (check(action)) {
        //substitute mocked data
        reaction = mocked;
        continue;
      }
    }
    //if not mocked, generate reaction from performer
    ({ value: reaction, done } = await performance.next(action));
  }
  throw `Performer with Exit:never should consume actions forever`;
}
