import { ACTOR, directSequence } from "@lauf/lauf-runner";
import {
  ActionCut,
  cutBeforeActionMatching,
  mockReaction,
} from "@lauf/lauf-runner-trial";

import { Prompt } from "../prompt";

import { dialogPlan } from "../dialog";

describe("Dialog ", () => {
  test("dialogPlan() prompts for name - minimal test", async () => {
    try {
      await directSequence(
        dialogPlan(),
        cutBeforeActionMatching(new Prompt("What is your full name?: "), ACTOR)
      );
    } catch (thrown) {
      expect(thrown).toBeInstanceOf(ActionCut);
    }
  });

  test("dialogPlan() prompts for name - detailed test", async () => {
    try {
      await directSequence(
        dialogPlan(),
        cutBeforeActionMatching(new Prompt("What is your full name?: "), ACTOR)
      );
    } catch (thrown) {
      expect(thrown).toBeInstanceOf(ActionCut);
      expect(thrown.action).toBeInstanceOf(Prompt);
    }
  });

  test("dialogPlan() challenges single names - minimal test", async () => {
    let testPerformer = ACTOR;
    testPerformer = mockReaction(
      new Prompt("What is your full name?: "),
      "Sting",
      testPerformer
    );
    testPerformer = cutBeforeActionMatching(
      new Prompt(
        "What?! Are you a celebrity or something, Sting? Enter a first and last name: "
      ),
      testPerformer
    );

    try {
      await directSequence(dialogPlan(), testPerformer);
    } catch (thrown) {
      expect(thrown).toBeInstanceOf(ActionCut);
    }
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
    testPerformer = cutBeforeActionMatching(
      new Prompt(
        "What?! Are you a celebrity or something, Sting? Enter a first and last name: "
      ),
      testPerformer
    );
    try {
      await directSequence(dialogSequence, testPerformer);
    } catch (thrown) {
      expect(thrown).toBeInstanceOf(ActionCut);
      expect(thrown.action).toBeInstanceOf(Prompt);
    }
  });
});
