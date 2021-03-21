import { Action, planOfAction } from "@lauf/lauf-runner";
import promptSync from "prompt-sync";

const doPrompt = promptSync();
const doAlert = console.log;

export class Prompt implements Action<string> {
  constructor(readonly message: string) {}
  act = () => doPrompt(this.message);
}
export const prompt = planOfAction(Prompt);

export class Alert implements Action<void> {
  constructor(readonly message: string) {}
  act = () => doAlert(this.message);
}
export const alert = planOfAction(Alert);
