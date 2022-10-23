import { Command, Plan } from "./types";

export function* step<Op extends (...args: any[]) => any>(
  ...command: Command<Op>
): Generator<Command<Op>, Awaited<ReturnType<Op>>, any> {
  return (yield command) as Awaited<ReturnType<Op>>;
}

/** Creates an async iterator,
 * The first iteration causes an command to be read from the plan and yields the command
 * The second iteration causes the command to be carried out and yields the result
 */
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
      try {
        // Tautological cast required by circularity issue (Typescript bug?)
        result = (await op(...args)) as Awaited<ReturnType<Op>>;
        yield result;
      } catch (error) {
        // pass to plan stack. If plan doesn't catch it, it will throw in the
        // following iteration (while yielding the next command)
        sequence.throw(error);
      }
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
