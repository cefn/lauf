import { Action, Performer } from "@lauf/lauf-runner";
import { ActionCut, ReactionCut } from "./cuts";

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
): Performer {
  return async (action: Action<any>) => {
    if (actionMatches(action, mockAction)) {
      return mockReaction;
    }
    return wrappedPerformer(action);
  };
}

export function cutBeforeAction(
  actionCheck: (action: Action<any>) => boolean,
  wrappedPerformer: Performer
): Performer {
  return async (action: Action<any>) => {
    if (actionCheck(action)) {
      throw new ActionCut(action);
    }
    return await wrappedPerformer(action);
  };
}

export function cutBeforeActionMatching(
  expectedAction: Action<any>,
  wrappedPerformer: Performer
): Performer {
  return cutBeforeAction(
    (actualAction) => actionMatches(actualAction, expectedAction),
    wrappedPerformer
  );
}

export function cutAfterReaction(
  reactionCheck: (reaction: any) => boolean,
  wrappedPerformer: Performer
): Performer {
  return async (action: Action<any>) => {
    const reaction = await wrappedPerformer(action);
    if (reactionCheck(reaction)) {
      throw new ReactionCut(action, reaction);
    }
    return reaction;
  };
}
