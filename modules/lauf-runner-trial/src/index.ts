import { Action, ACTOR, Performer, TERMINATE } from "@lauf/lauf-runner";

export function actionMatches<
  Actual extends Action<any>,
  Expected extends Actual
>(actual: Actual, expected: Expected): actual is Expected {
  return (
    actual.constructor === expected.constructor &&
    JSON.stringify(actual) === JSON.stringify(expected)
  );
}

export function mockReaction<T>(
  mockAction: Action<T>,
  mockReaction: T,
  wrappedPerformer: Performer
) {
  return async (action: Action<any>) => {
    if (actionMatches(action, mockAction)) {
      return mockReaction;
    }
    return wrappedPerformer(action);
  };
}

export function cutBeforeAction<T>(
  actionCheck: (action: Action<any>) => boolean,
  wrappedPerformer: Performer
) {
  return async (action: Action<any>) => {
    if (actionCheck(action)) {
      return TERMINATE;
    }
    return await wrappedPerformer(action);
  };
}

export function cutAfterReaction<T>(
  reactionCheck: (reaction: any) => boolean,
  wrappedPerformer: Performer
) {
  return async (action: Action<any>) => {
    const reaction = await wrappedPerformer(action);
    if (reactionCheck(reaction)) {
      return TERMINATE;
    }
    return reaction;
  };
}
