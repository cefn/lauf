#!/usr/bin/env -S npx ts-node
import { ActionSequence, performPlan } from "@lauf/lauf-runner";

import { prompt } from "./prompt";

performPlan(function* (): ActionSequence {
  yield {
    act: () => prompt("What is your full name? "),
  };
});
