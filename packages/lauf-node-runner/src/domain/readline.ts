import readline from "readline";
import { Action, createActionPlan } from "@lauf/lauf-runner";

class Print implements Action<void> {
  constructor(readonly message: string) {}
  act() {
    console.log(this.message);
  }
}

class Prompt implements Action<string> {
  constructor(readonly message: string) {}
  async act() {
    const rl = readline.createInterface(process.stdin, process.stdout);
    try {
      return await new Promise<string>((resolve) => {
        rl.question(this.message, resolve);
      });
    } finally {
      rl.close();
    }
  }
}

export const print = createActionPlan(Print);
export const prompt = createActionPlan(Prompt);
