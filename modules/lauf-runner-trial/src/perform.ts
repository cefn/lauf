import { isDeepStrictEqual } from "util";
import { Action, Performance, actor, isAction } from "@lauf/lauf-runner";

type ActionCheck = (candidate: Action<any>) => boolean;

function actionMatches<Actual extends Action<any>, Expected extends Actual>(
  actual: Actual,
  expected: Expected
): actual is Expected {
  return (
    actual.constructor === expected.constructor &&
    JSON.stringify(actual) === JSON.stringify(expected)
  );
}

export function createActionMatcher<Reaction>(expected: Action<Reaction>) {
  return (candidate: Action<Reaction>) => {
    return actionMatches(candidate, expected);
  };
}

export async function* performUntilActionFulfils<Reaction>(
  criterion: (candidate: Action<Reaction>) => boolean,
  performance: Performance<any, Reaction> = actor()
): Performance<Action<Reaction>, Reaction> {
  let { value: reaction, done } = await performance.next();
  let action = yield undefined as any;
  do {
    if (criterion(action)) {
      return action;
    }
    ({ value: reaction, done } = await performance.next(action));
    action = yield reaction;
  } while (!done);
  throw `Performer with Exit:never should consume actions forever`;
}

export async function* performUntilReactionFulfils<Reaction>(
  criterion: (candidate: Reaction) => boolean,
  performance: Performance<any, Reaction> = actor()
): Performance<Reaction, Reaction> {
  await performance.next();
  let reaction, done;
  let action = yield undefined as any;
  do {
    ({ value: reaction, done } = await performance.next(action));
    if (criterion(reaction)) {
      return reaction;
    }
    action = yield reaction;
  } while (!done);
  throw `Performer with Exit:never should consume actions forever`;
}

export async function* performWithMocks<Reaction>(
  mocks: Array<[ActionCheck | Action<any>, Reaction]>,
  performance: Performance<any, Reaction> = actor()
): Performance<never, Reaction> {
  //substitute action 'checks' with a matcher for the action
  const normalisedMocks = mocks.map<[ActionCheck, Reaction]>(
    ([check, mocked]) => [
      isAction(check) ? createActionMatcher(check) : check,
      mocked,
    ]
  );
  await performance.next();
  let reaction, done;
  let action = yield undefined as any;
  do {
    for (const [check, mocked] of normalisedMocks) {
      if (check(action)) {
        //substitute mocked data
        action = yield mocked;
        continue;
      }
    }
    ({ value: reaction, done } = await performance.next(action));
    action = yield reaction;
  } while (!done);
  throw `Performer with Exit:never should consume actions forever`;
}
