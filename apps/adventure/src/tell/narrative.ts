import { Store } from "@lauf/store";
import { Sequence } from "@lauf/stepmachine";

export type Passage = string | JSX.Element;

export type Tell = (passage: Passage) => Promise<void>;

export type Prompt = <
  Choices extends Readonly<[Passage, Passage, ...Passage[]]>
>(
  intro: Passage,
  choices: Choices
) => Promise<Choices[number]>;

export type Narrative<Rtn> = Sequence<Rtn, Tell | Prompt>;

/** Visits narrative if named boolean is false (also setting the boolean) */
export function* lazyVisitNarrative<
  GuardingState extends { [k in GuardKey]: boolean },
  GuardKey extends string
>(
  store: Store<GuardingState>,
  guardName: GuardKey,
  narrative: () => Narrative<void>
): Narrative<boolean> {
  if (!store.read()[guardName]) {
    yield* narrative();
    store.write({
      ...store.read(),
      [guardName]: true,
    });
    return true;
  }
  return false;
}
