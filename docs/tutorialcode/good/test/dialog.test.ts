import {
  actor,
  directSequence,
  Performer,
  Performance,
  Action,
  isTermination,
} from "@lauf/lauf-runner";
import {
  performUntilActionFulfils,
  createActionMatcher,
  performWithMocks,
} from "@lauf/lauf-runner-trial";

import { Prompt } from "../prompt";

import { dialogPlan } from "../dialog";

describe("Dialog ", () => {
  test("dialogPlan() prompts for name", async () => {
    const dialogSequence = dialogPlan();
    const ending = await directSequence(dialogSequence, () =>
      performUntilActionFulfils(
        createActionMatcher(new Prompt("What is your full name?"))
      )
    );
    expect(isTermination(ending));
  });

  test("dialogPlan() challenges single names", async () => {
    const dialogSequence = dialogPlan();
    const ending = await directSequence(dialogSequence, () =>
      performUntilActionFulfils(
        createActionMatcher(
          new Prompt("What are you, a celebrity? Enter a first and last name")
        ),
        () => performWithMocks([[new Prompt("What is your name?"), "Sting"]])
      )
    );
    expect(isTermination(ending));
  });
});
