#!/usr/bin/env -S npx ts-node
import { ActionSequence, performPlan } from "@lauf/lauf-runner/src";

import { prompt, alert } from "./prompt";

function* simplePlan(): ActionSequence {
  const name = yield { act: () => prompt("What is your full name? ") };
  yield { act: () => alert(`Pleased to meet you, ${name as string}!`) };
}

performPlan(simplePlan);
