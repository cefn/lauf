import { Action, Performer, Performance, actor } from "@lauf/lauf-runner";

type ActionExpectation<Reaction = any> = (actual: Action<Reaction>) => boolean;

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

export function createMatchExpectation<Reaction>(
  expected: Action<Reaction>
): ActionExpectation<Reaction> {
  return (actual: Action<Reaction>) => actionMatches(actual, expected);
}

export async function* performUntil<Reaction = any>(
  trigger: Reaction,
  expectation: ActionExpectation<Reaction>,
  standin: Performer<Reaction, never> = actor
): Performance<Reaction, Action<Reaction>> {
  let reaction = trigger;
  let action = yield reaction;
  const performance = standin(action);
  while (true) {
    if (expectation(action)) {
      return action;
    } else {
      ({ value: reaction } = await performance.next(action));
    }
  }
}

export async function* performUntilAfter<Reaction = any>(
  trigger: Reaction,
  expectation: ActionExpectation<Reaction>,
  standin: Performer<Reaction, never> = actor
): Performance<Reaction, Action<Reaction>> {
  const action = yield* performUntil(trigger, expectation, standin);
  const performance = standin(action);
  const { value: reaction } = await performance.next(action);
  return yield reaction;
}
