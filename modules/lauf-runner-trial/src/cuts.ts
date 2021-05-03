/** Defines objects intended to be thrown to terminate a Sequence. */
import { Action } from "@lauf/lauf-runner";

export type Cut<Kind extends Symbol> = {
  kind: Kind;
};

export function isCut<Kind extends symbol = symbol>(
  item: any,
  expectedKind?: Kind
): item is Cut<Kind> {
  const actualKind = item?.kind;
  if (typeof actualKind !== "symbol") {
    return false;
  }
  if (expectedKind && expectedKind !== actualKind) {
    return false;
  }
  return true;
}

class BasicCut<Kind extends symbol> implements Cut<Kind> {
  constructor(readonly kind: Kind) {}
}

export const ACTION_CUT = Symbol("action-cut");
export class ActionCut<T> extends BasicCut<typeof ACTION_CUT> {
  constructor(readonly action: Action<T>) {
    super(ACTION_CUT);
  }
}

export const REACTION_CUT = Symbol("reaction-cut");
export class ReactionCut<T> extends BasicCut<typeof REACTION_CUT> {
  constructor(readonly action: Action<T>, readonly reaction: T) {
    super(REACTION_CUT);
  }
}
