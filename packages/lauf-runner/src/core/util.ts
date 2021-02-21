import type { Performance, Script, ActionClass } from "../types";

/** Streamline script creation from any Action class. */
export function createActionScript<Params extends any[], Reaction = any>(
  actionClass: ActionClass<Params, Reaction>
): Script<Params, Reaction> {
  return function* (...actionParams: Params) {
    const action = new actionClass(...actionParams);
    const result: Reaction = yield action;
    return result;
  };
}

//TODO make generic, passing through script parameters
export function createPerformance<Ending>(
  script: Script<[], Ending>
): Performance<Ending> {
  return script();
}

/** Gets Actions from performance, then awaits action#act()
 * and passes the Reaction back into next() until performance is done.
 * Errors are passed to performance.throw then thrown here.
 * @returns Ending of performance. */
export async function stagePerformance<Ending>(
  performance: Performance<Ending>
): Promise<Ending> {
  try {
    //cannot accept value before first 'yield'
    let generated = performance.next();
    while (!generated.done) {
      const reaction = await generated.value.act();
      generated = performance.next(reaction);
    }
    return generated.value;
  } catch (error) {
    performance.throw(error);
    throw error;
  }
}

export async function stageScript<Ending>(
  script: Script<[], Ending>
): Promise<Ending> {
  const performance = createPerformance(script);
  return await stagePerformance(performance);
}
