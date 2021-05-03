import {
  Action,
  ActionPlan,
  ACTOR,
  BackgroundPlan,
  directPlan,
  Performer,
} from "@lauf/lauf-runner";
import { Store } from "@lauf/lauf-store";

type ForkId = string;

interface ForkHandle {
  id: ForkId;
  performer: Performer;
}

export class Tracker<State> {
  protected nextForkOrdinal = 0;
  protected nextEventOrdinal = 0;
  protected forkHandles: Record<ForkId, ForkHandle> = {};
  protected initialState: State;
  constructor(
    readonly store: Store<State>,
    readonly performer: Performer = ACTOR
  ) {
    this.initialState = store.read();
  }

  assignForkId() {
    return this.nextForkOrdinal++;
  }

  assignEventId() {
    return this.nextEventOrdinal++;
  }

  protected createForkHandle<Args extends any[], Ending, Reaction>(
    plan: ActionPlan<Args, Ending, Reaction>,
    performer: Performer,
    parent?: ForkHandle
  ): ForkHandle {
    //construct id
    let id = parent ? `${parent.id}-` : "";
    id += this.assignForkId();
    id += `-${plan.name}`;

    //construct handle (including child fork interception)
    const forkHandle = {
      id,
      performer: async (action: Action<any>) => {
        //intercept child fork
        if (action instanceof BackgroundPlan) {
          //create child handle, constructing forked performer
          const childForkHandle = this.createForkHandle(
            action.plan,
            action.performer,
            forkHandle
          );
          //create action using forked performer instead
          action = new BackgroundPlan(
            action.plan,
            action.args,
            childForkHandle.performer
          );
        }
        const reaction = await performer(action);
        return reaction;
      },
    };
    this.forkHandles[forkHandle.id] = forkHandle;
    return forkHandle;
  }

  async performPlan<Args extends any[], Ending, Reaction>(
    plan: ActionPlan<Args, Ending, Reaction>,
    ...args: Args
  ): Promise<Ending> {
    const forkHandle = this.createForkHandle(
      plan,
      this.performer
      /* root plan has no parent handle */
    );
    return await directPlan(plan, args, forkHandle.performer);
  }
}
