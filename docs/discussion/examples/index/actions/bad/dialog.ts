#!/usr/bin/env -S npx ts-node
import { ActionSequence, performPlan } from "@lauf/lauf-runner";
import { Alert } from "../good/prompt";

import { prompt, alert } from "./prompt";

export function* dialogPlan(): ActionSequence<string[], any> {
  let names = null;
  let message = "What is your full name?: ";
  while (true) {
    const response = (yield { act: () => prompt(message) }) as string;
    names = response.match(/[\w]+/g);
    if (names) {
      if (names.length > 1) {
        break;
      }
      if (names.length === 1) {
        const [name] = names;
        message = `What?! Are you a celebrity or something, ${name}? Enter a first and last name: `;
      }
    } else {
      message = "I'm sorry, you can't be anonymous. Enter your full name: ";
    }
  }
  const [first, last] = names;
  yield { act: () => alert(`Pleased to meet you, ${first}!`) };
  return names;
}

async function run() {
  const names = await performPlan(dialogPlan);
  console.log(`Sequence ended with ${names}`);
}

if (require.main === module) {
  run();
}
