import {
  Action,
  ActionPlan,
  ACTOR,
  BackgroundPlan,
  directPlan,
  Performer,
} from "@lauf/lauf-runner";
import { Immutable, Store } from "@lauf/lauf-store";

export class Event {
  readonly time: number;
  constructor(readonly ordinal: number) {
    this.time = new Date().getTime();
  }
}

export class ForkEvent extends Event {
  constructor(readonly forkHandle: ForkHandle<any, any, any>, ordinal: number) {
    super(ordinal);
  }
}

export class ActionEvent<Reaction> extends ForkEvent {
  constructor(
    readonly action: Action<Reaction>,
    forkHandle: ForkHandle<any, any, any>,
    ordinal: number
  ) {
    super(forkHandle, ordinal);
  }
}

export class ReactionEvent<Reaction> extends ForkEvent {
  constructor(
    readonly reaction: Reaction,
    forkHandle: ForkHandle<any, any, any>,
    ordinal: number
  ) {
    super(forkHandle, ordinal);
  }
}

export class StoreEvent<State> extends Event {
  readonly state: Immutable<State>;
  constructor(readonly store: Store<State>, ordinal: number) {
    super(ordinal);
    this.state = store.read();
  }
}

type ForkId = string;

interface ForkHandle<Args extends any[], Ending, Reaction> {
  id: ForkId;
  performer: Performer;
  plan: ActionPlan<Args, Ending, Reaction>;
  args: Args;
  ending?: Ending;
}

export class Tracker<State> {
  protected nextForkOrdinal = 0;
  protected nextEventOrdinal = 0;
  forkHandles: Immutable<Record<ForkId, ForkHandle<any, any, any>>> = {};
  events: Immutable<Event[]> = [];
  constructor(
    readonly store: Store<State>,
    readonly performer: Performer = ACTOR
  ) {
    const recordState = () =>
      (this.events = [
        ...this.events,
        new StoreEvent(store, this.assignEventId()),
      ]);
    recordState(); //record initial state
    store.watch(recordState); //track future events
  }

  assignForkId() {
    return this.nextForkOrdinal++;
  }

  assignEventId() {
    return this.nextEventOrdinal++;
  }

  protected createForkHandle<Args extends any[], Ending, Reaction>(
    plan: ActionPlan<Args, Ending, Reaction>,
    args: Args,
    performer: Performer,
    parent?: ForkHandle<any, any, any>
  ): ForkHandle<Args, Ending, Reaction> {
    //construct id
    let id = parent ? `${parent.id}-` : "";
    id += this.assignForkId();
    id += `-${plan.name}`;

    //construct handle (including child fork interception)
    const forkHandle = {
      id,
      plan,
      args,
      performer: async (action: Action<any>) => {
        //intercept child fork
        if (action instanceof BackgroundPlan) {
          //create child handle, constructing forked performer
          const childForkHandle = this.createForkHandle(
            action.plan,
            action.args,
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
        this.events = [
          ...this.events,
          new ActionEvent(action, forkHandle, this.assignEventId()),
        ];
        const reaction = await performer(action);
        this.events = [
          ...this.events,
          new ReactionEvent(reaction, forkHandle, this.assignEventId()),
        ];
        return reaction;
      },
    };
    this.forkHandles = {
      ...this.forkHandles,
      [forkHandle.id]: forkHandle,
    };
    return forkHandle;
  }

  async performPlan<Args extends any[], Ending, Reaction>(
    plan: ActionPlan<Args, Ending, Reaction>,
    ...args: Args
  ): Promise<Ending> {
    //create root forkHandle
    const forkHandle = this.createForkHandle(
      plan,
      args,
      this.performer
      /* root has no parent */
    );
    return await directPlan(
      forkHandle.plan,
      forkHandle.args,
      forkHandle.performer
    );
  }
}
