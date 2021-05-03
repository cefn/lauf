import { ACTOR, directSequence, isTermination } from "@lauf/lauf-runner";
import { cutBeforeActionMatches, mockReaction } from "@lauf/lauf-runner-trial";

import { Prompt } from "../prompt";

import { dialogPlan } from "../dialog";

describe("Dialog ", () => {
  test("dialogPlan() prompts for name - minimal test", async () => {
    await directSequence(
      dialogPlan(),
      cutBeforeActionMatches(new Prompt("What is your full name?: "), ACTOR)
    );
  });

  test("dialogPlan() prompts for name - detailed test", async () => {
    const ending = await directSequence(
      dialogPlan(),
      cutBeforeActionMatches(new Prompt("What is your full name?: "), ACTOR)
    );
    expect(isTermination(ending));
  });

  test("dialogPlan() challenges single names - minimal test", async () => {
    let testPerformer = ACTOR;
    testPerformer = mockReaction(
      new Prompt("What is your full name?: "),
      "Sting",
      testPerformer
    );
    testPerformer = cutBeforeActionMatches(
      new Prompt(
        "What?! Are you a celebrity or something, Sting? Enter a first and last name: "
      ),
      testPerformer
    );

    await directSequence(dialogPlan(), testPerformer);
  });

  test("dialogPlan() challenges single names - detailed test", async () => {
    const dialogSequence = dialogPlan();
    //call act by default
    let testPerformer = ACTOR;
    //mock an action
    testPerformer = mockReaction(
      new Prompt("What is your full name?: "),
      "Sting",
      testPerformer
    );
    //cut when condition reached
    testPerformer = cutBeforeActionMatches(
      new Prompt(
        "What?! Are you a celebrity or something, Sting? Enter a first and last name: "
      ),
      testPerformer
    );
    const ending = await directSequence(dialogSequence, testPerformer);
    expect(isTermination(ending));
  });
});
