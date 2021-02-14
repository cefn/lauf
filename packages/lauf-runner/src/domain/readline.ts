import readline from "readline";
import { Action } from "../types";
import { createActionProcedure } from "../core/util";

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

export const print = createActionProcedure(Print);
export const prompt = createActionProcedure(Prompt);
