import {
  Action,
  ActionPlan,
  ACTOR,
  BackgroundPlan,
  directPlan,
  Performer,
} from "@lauf/lauf-runner";
import { BasicStore, Immutable, Store } from "@lauf/lauf-store";

export interface Event {
  time: number;
  ordinal: number;
}

export interface StoreEvent<State> extends Event {
  store: Store<State>;
  state: Immutable<State>;
}

export type ForkId = string;

export interface ForkHandle<Args extends any[], Ending, Reaction> {
  id: ForkId;
  performer: Performer;
  plan: ActionPlan<Args, Ending, Reaction>;
  args: Args;
  ending?: Ending;
}

export interface ForkEvent<Args extends any[], Ending, Reaction> extends Event {
  forkHandle: ForkHandle<Args, Ending, Reaction>;
}

export interface ActionEvent<Args extends any[], Ending, Reaction>
  extends ForkEvent<Args, Ending, Reaction> {
  action: Action<Reaction>;
}

export interface ReactionEvent<Args extends any[], Ending, Reaction>
  extends ForkEvent<Args, Ending, Reaction> {
  reaction: Reaction;
  actionEvent: ActionEvent<Args, Ending, Reaction>;
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
  protected nextForkOrdinal = 0;
  protected nextEventOrdinal = 0;
  readonly trackerStore = new BasicStore(initialTrackerState);
  constructor(
    readonly planStore: Store<State>,
    readonly performer: Performer = ACTOR
  ) {
    const recordState = () => {
      const storeEvent: StoreEvent<State> = {
        store: planStore,
        state: planStore.read(),
        ...this.populateEvent(),
      };
      this.trackerStore.edit((state) => {
        state.events = [...state.events, storeEvent];
      });
    };
    recordState(); //record initial state
    planStore.watch(recordState); //track future events
  }

  assignForkId() {
    return this.nextForkOrdinal++;
  }

  assignEventId() {
    return this.nextEventOrdinal++;
  }

  populateEvent() {
    return {
      time: new Date().getTime(),
      ordinal: this.assignEventId(),
    };
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
        //record action
        const actionEvent: ActionEvent<Args, Ending, Reaction> = {
          action,
          forkHandle,
          ...this.populateEvent(),
        };
        this.trackerStore.edit((state) => {
          state.events = [...state.events, actionEvent];
        });
        //complete action
        const reaction = await performer(action);
        //record reaction
        const reactionEvent: ReactionEvent<Args, Ending, Reaction> = {
          reaction,
          actionEvent,
          forkHandle,
          ...this.populateEvent(),
        };
        this.trackerStore.edit((state) => {
          state.events = [...state.events, reactionEvent];
        });
        return reaction;
      },
    };
    this.trackerStore.edit((state) => {
      state.forkHandles = {
        ...state.forkHandles,
        [forkHandle.id]: forkHandle,
      };
    });
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
