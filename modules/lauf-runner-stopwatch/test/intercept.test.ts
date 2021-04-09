import { Action, ActionSequence, planOfAction } from "@lauf/lauf-runner/src";
import { interceptPlan, PlanInterceptor } from "../src/intercept";

describe("Process Logging", () => {
  describe("Logging a Single Process", () => {
    test("Intercepter is called ", async () => {
      const actNotifier = jest.fn();
      const interceptActionNotifier = jest.fn();
      const interceptReactionNotifier = jest.fn();

      class Noop implements Action<void> {
        constructor(readonly value: number) {}
        act() {
          actNotifier(this.value);
        }
      }
      const noop = planOfAction(Noop);

      const planInterceptor: PlanInterceptor<any> = {
        interceptAction<Reaction>(action: Action<Reaction>) {
          interceptActionNotifier(action);
          return action;
        },
        interceptReaction<Reaction>(reaction: Reaction) {
          interceptReactionNotifier(reaction);
          return reaction;
        },
      };

      function* countPlan(): ActionSequence<void, any> {
        for (const i of [3, 4, 5]) {
          yield* noop(i);
        }
      }

      await interceptPlan(countPlan, [], planInterceptor);

      expect(actNotifier).toHaveBeenCalledTimes(3);
      expect(interceptActionNotifier).toHaveBeenCalledTimes(3);
      expect(interceptReactionNotifier).toHaveBeenCalledTimes(3);
    });
  });
});
