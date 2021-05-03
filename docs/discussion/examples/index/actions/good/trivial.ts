#!/usr/bin/env -S npx ts-node
import { ActionSequence, performPlan } from "@lauf/lauf-runner";

import { Prompt, prompt } from "./prompt";

performPlan(function* (): ActionSequence<void, any> {
  yield* prompt("What is your full name? ");
});
