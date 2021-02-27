import { Action, Performer, Performance, actor } from "@lauf/lauf-runner";

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

export async function* performUntilActionFulfils<Reaction>(
  action: Action<Reaction>,
  criterion: (candidate: Action<Reaction>) => boolean,
  performer: Performer<never, Reaction>
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

export async function* actUntilActionFulfils<Reaction>(
  action: Action<Reaction>,
  criterion: (candidate: Action<Reaction>) => boolean
): Performance<Action<Reaction>, Reaction> {
  return yield* performUntilActionFulfils(action, criterion, actor);
}

export async function* actUntilActionMatches<Reaction>(
  action: Action<Reaction>,
  expected: Action<Reaction>
): Performance<Action<Reaction>, Reaction> {
  return yield* actUntilActionFulfils(action, (candidate: Action<Reaction>) =>
    actionMatches(candidate, expected)
  );
}

export async function* performUntilReactionFulfils<Reaction>(
  action: Action<Reaction>,
  criterion: (candidate: Reaction) => boolean,
  performer: Performer<never, Reaction>
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

export async function* actUntilReactionFulfils<Reaction>(
  action: Action<Reaction>,
  criterion: (candidate: Reaction) => boolean
): Performance<Reaction, Reaction> {
  return yield* performUntilReactionFulfils(action, criterion, actor);
}
