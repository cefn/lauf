import { directSequence, isTermination } from "@lauf/lauf-runner";
import {
  performUntilActionFulfils,
  createActionMatcher,
  performWithMocks,
} from "@lauf/lauf-runner-trial";

import { Prompt } from "../prompt";

import { dialogPlan } from "../dialog";

describe("Dialog ", () => {
  test("dialogPlan() prompts for name - minimal test", async () => {
    await directSequence(
      dialogPlan(),
      performUntilActionFulfils(
        createActionMatcher(new Prompt("What is your full name?: "))
      )
    );
  });

  test("dialogPlan() prompts for name - detailed test", async () => {
    const dialogSequence = dialogPlan();
    const ending = await directSequence(
      dialogSequence,
      performUntilActionFulfils(
        createActionMatcher(new Prompt("What is your full name?: "))
      )
    );
    expect(isTermination(ending));
  });

  test("dialogPlan() challenges single names - minimal test", async () => {
    await directSequence(
      dialogPlan(),
      performUntilActionFulfils(
        createActionMatcher(
          new Prompt(
            "What?! Are you a celebrity or something, Sting? Enter a first and last name: "
          )
        ),
        performWithMocks([[new Prompt("What is your full name?: "), "Sting"]])
      )
    );
  });

  test("dialogPlan() challenges single names - detailed test", async () => {
    const dialogSequence = dialogPlan();
    const ending = await directSequence(
      dialogSequence,
      performUntilActionFulfils(
        createActionMatcher(
          new Prompt(
            "What?! Are you a celebrity or something, Sting? Enter a first and last name: "
          )
        ),
        performWithMocks([[new Prompt("What is your full name?: "), "Sting"]])
      )
    );
    expect(isTermination(ending));
  });
});