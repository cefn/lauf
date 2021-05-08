import {
  Action,
  ActionPlan,
  ACTOR,
  BackgroundPlan,
  directPlan,
  Performer,
} from "@lauf/lauf-runner";
import { BasicStore, Immutable, Store } from "@lauf/lauf-store";

let nextEventOrdinal = 0;
let nextForkOrdinal = 0;
export type EventId = number;
export type ForkId = string;

function freezeThis(
  thisObject: object,
  constructor: new (...args: any[]) => any
) {
  if (thisObject.constructor === constructor) {
    Object.freeze(thisObject);
  }
}

export class Event {
  constructor(
    readonly time: number = new Date().getTime(),
    readonly ordinal: number = nextEventOrdinal++
  ) {
    freezeThis(this, Event);
  }
}

export class StoreEvent<State> extends Event {
  readonly state: Immutable<State>;
  constructor(readonly store: Store<State>, time?: number, ordinal?: number) {
    super(time, ordinal);
    this.state = store.read();
    freezeThis(this, StoreEvent);
  }
}

export class ForkHandle<Args extends any[], Ending, Reaction> {
  ending?: Ending;
  constructor(
    readonly plan: ActionPlan<Args, Ending, Reaction>,
    readonly args: Args,
    readonly performer: Performer,
    readonly id: ForkId = (nextForkOrdinal++).toString(),
    ending?: Ending
  ) {
    this.ending = ending;
    freezeThis(this, ForkHandle);
  }
}

export class ForkEvent<Args extends any[], Ending, Reaction> extends Event {
  constructor(
    readonly forkHandle: ForkHandle<Args, Ending, Reaction>,
    time?: number,
    ordinal?: number
  ) {
    super(time, ordinal);
    freezeThis(this, ForkEvent);
  }
}

export class ActionEvent<
  Args extends any[],
  Ending,
  Reaction
> extends ForkEvent<Args, Ending, Reaction> {
  constructor(
    readonly action: Action<Reaction>,
    forkHandle: ForkHandle<Args, Ending, Reaction>,
    time?: number,
    ordinal?: number
  ) {
    super(forkHandle, time, ordinal);
    freezeThis(this, ActionEvent);
  }
}

export class ReactionEvent<
  Args extends any[],
  Ending,
  Reaction
> extends ForkEvent<Args, Ending, Reaction> {
  constructor(
    readonly reaction: Reaction,
    readonly actionEvent: ActionEvent<Args, Ending, Reaction>,
    forkHandle: ForkHandle<Args, Ending, Reaction>,
    time?: number,
    ordinal?: number
  ) {
    super(forkHandle, time, ordinal);
    freezeThis(this, ReactionEvent);
  }
}

interface TrackerState {
  forkHandles: Record<ForkId, ForkHandle<any, any, any>>;
  events: Event[];
}

const initialTrackerState: Immutable<TrackerState> = {
  forkHandles: {},
  events: [],
} as const;

export class Tracker<State> {
  readonly trackerStore = new BasicStore(initialTrackerState);
  constructor(
    readonly planStore: Store<State>,
    readonly performer: Performer = ACTOR
  ) {
    const recordState = () => {
      this.trackerStore.edit((state) => {
        state.events = [...state.events, new StoreEvent(planStore)];
      });
    };
    recordState(); //record initial state
    planStore.watch(recordState); //track future events
  }

  protected createForkHandle<Args extends any[], Ending, Reaction>(
    forkPlan: ActionPlan<Args, Ending, Reaction>,
    forkArgs: Args,
    performer: Performer,
    parent?: ForkHandle<any, any, any>
  ): ForkHandle<Args, Ending, Reaction> {
    //construct id
    let forkId = parent ? `${parent.id}-` : "";
    forkId += nextForkOrdinal++;
    forkId += `-${forkPlan.name}`;
    const forkPerformer = async (action: Action<any>) => {
      //intercept child fork action
      if (action instanceof BackgroundPlan) {
        action = this.interceptForkAction(action, forkHandle);
      }
      const actionEvent = this.recordAction(action, forkHandle);
      //complete action
      const reaction = await performer(action);
      this.recordReaction(reaction, actionEvent, forkHandle);
      return reaction;
    };
    const forkHandle = new ForkHandle(
      forkPlan,
      forkArgs,
      forkPerformer,
      forkId
    );
    this.trackerStore.edit((state) => {
      state.forkHandles = {
        ...state.forkHandles,
        [forkId]: forkHandle,
      };
    });
    return forkHandle;
  }

  interceptForkAction<Args extends any[], Ending, Reaction>(
    action: BackgroundPlan<Args, Ending, Reaction>,
    parentForkHandle: ForkHandle<Args, Ending, Reaction>
  ) {
    //create child handle, constructing forked performer
    const childForkHandle = this.createForkHandle(
      action.plan,
      action.args,
      action.performer,
      parentForkHandle
    );
    //substitute action that uses forked performer instead
    return new BackgroundPlan(
      action.plan,
      action.args,
      childForkHandle.performer
    );
  }

  recordAction<Args extends any[], Ending, Reaction>(
    action: Action<Reaction>,
    forkHandle: ForkHandle<Args, Ending, Reaction>
  ) {
    const actionEvent = new ActionEvent(action, forkHandle);
    this.trackerStore.edit((state) => {
      state.events = [...state.events, actionEvent];
    });
    return actionEvent;
  }

  recordReaction<Args extends any[], Ending, Reaction>(
    reaction: Reaction,
    actionEvent: ActionEvent<Args, Ending, Reaction>,
    forkHandle: ForkHandle<Args, Ending, Reaction>
  ) {
    const reactionEvent = new ReactionEvent(reaction, actionEvent, forkHandle);
    this.trackerStore.edit((state) => {
      state.events = [...state.events, reactionEvent];
    });
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
