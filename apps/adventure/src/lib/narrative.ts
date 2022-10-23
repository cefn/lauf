import { Immutable, Store } from "@lauf/store";
import { Sequence, step } from "@lauf/stepmachine";

export type Passage = string | JSX.Element;

export type Tell = (passage: Passage) => Promise<void>;

export type Prompt = <Choices extends Readonly<[string, string, ...string[]]>>(
  intro: Passage,
  choices: Choices
) => Promise<Choices[number]>;

export type Narrative<Rtn> = Sequence<Rtn, Tell | Prompt>;

export type NarrativeFn = () => Narrative<void>;

/** Visits narrative if named boolean is false (also setting the boolean) */
export function* lazyVisitNarrative<
  FlaggedState extends { [k in FlagName]: boolean },
  FlagName extends string
>(
  store: Store<FlaggedState>,
  flagName: FlagName,
  createNarrative: () => Narrative<void>
): Narrative<boolean> {
  if (!store.read()[flagName]) {
    yield* createNarrative();
    store.write({
      ...store.read(),
      [flagName]: true,
    });
    return true;
  }
  return false;
}

export function* visitChosenNarrative<
  Choice extends string,
  Lookup extends { [key in Choice]: () => Narrative<void> }
>(prompt: Prompt, intro: Passage, lookup: Lookup) {
  const choices = Object.keys(lookup);
  if (choices.length < 2) {
    throw new Error(`Not enough choices in ${JSON.stringify(lookup)}`);
  }
  const chosenLabel = (yield* step(
    prompt,
    intro,
    choices as [Choice, Choice, ...Choice[]]
  )) as Choice;

  const narrative = lookup[chosenLabel];
  yield* narrative();
}
