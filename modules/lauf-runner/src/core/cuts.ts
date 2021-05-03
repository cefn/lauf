/** Defines objects intended to be thrown to terminate a Sequence. */
import { Action } from "../types";

export type Cut<Kind extends Symbol> = {
  kind: Kind;
};

function isCut<Kind extends symbol = symbol>(
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

const ACTION_CUT = Symbol("action-cut");
export class ActionCut<T> extends BasicCut<typeof ACTION_CUT> {
  constructor(readonly action: Action<T>) {
    super(ACTION_CUT);
  }
}

const REACTION_CUT = Symbol("reaction-cut");
export class ReactionCut<T> extends BasicCut<typeof REACTION_CUT> {
  constructor(readonly reaction: T) {
    super(REACTION_CUT);
  }
}
