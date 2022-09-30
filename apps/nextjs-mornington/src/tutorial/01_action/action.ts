import { Action, planOfAction } from "@lauf/lauf-runner";

export class Prompt implements Action<string | null> {
  constructor(readonly message: string) {}
  act = () => window.prompt(this.message);
}
export const prompt = planOfAction(Prompt);
