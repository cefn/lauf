import { Command, Plan } from "./types";

export function* step<Op extends (...args: any[]) => any>(
  ...command: Command<Op>
) {
  return (yield command) as Awaited<ReturnType<Op>>;
}

/** Presents an async iterator which  */
export async function* createPerformance<
  Ending,
  Op extends (...args: any[]) => any = (...args: unknown[]) => unknown
>(plan: Plan<Ending, Op>) {
  const sequence = plan();
  let result: Awaited<ReturnType<Op>> | undefined = undefined;
  for (;;) {
    const instructionResult = result ? sequence.next(result) : sequence.next();
    if (instructionResult.done) {
      return instructionResult.value;
    } else {
      const instruction = instructionResult.value;
      yield instruction;
      const [op, ...args] = instruction;
      // Tautological cast required by circularity issue (Typescript bug?)
      result = (await op(...args)) as Awaited<ReturnType<Op>>;
      yield result;
    }
  }
}

export async function promiseEnding<Ending, Op extends (...args: any[]) => any>(
  plan: Plan<Ending, Op>
) {
  const performance = createPerformance(plan);
  for (;;) {
    const result = await performance.next();
    if (result.done) return result.value;
  }
}
