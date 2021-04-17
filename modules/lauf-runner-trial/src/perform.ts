import { Action } from "@lauf/lauf-runner";

type ActionCheck = (candidate: Action<any>) => boolean;

export function actionMatches<
  ExpectedReaction extends ActualReaction,
  ActualReaction = any
>(
  actual: Action<ActualReaction>,
  expected: Action<ExpectedReaction>
): actual is Action<ExpectedReaction> {
  return (
    actual.constructor === expected.constructor &&
    JSON.stringify(actual) === JSON.stringify(expected)
  );
}
