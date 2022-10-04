import { Plan } from "./types";

/** Presents an async iterator which  */
export async function* createPerformance<
  Ending,
  Op extends (...args: any[]) => any = (...args: unknown[]) => unknown
>(plan: Plan<Ending, Op>) {
  const sequence = plan();
  let nextValue: Awaited<ReturnType<Op>> | undefined = undefined;
  for (;;) {
    const instructionResult = nextValue
      ? sequence.next(nextValue)
      : sequence.next();
    if (instructionResult.done) {
      return instructionResult.value;
    } else {
      const instruction = instructionResult.value;
      const [op, ...args] = instruction;
      // Tautological cast required by circularity issue (Typescript bug?)
      nextValue = (await op(...args)) as Awaited<ReturnType<Op>>;
      yield [instruction, nextValue] as const;
    }
  }
}

export async function promiseEnding<
  Ending,
  Op extends (...args: any[]) => any = (...args: unknown[]) => unknown
>(plan: Plan<Ending, Op>) {
  const performance = createPerformance(plan);
  for (;;) {
    const result = await performance.next();
    if (result.done) return result.value;
  }
}
