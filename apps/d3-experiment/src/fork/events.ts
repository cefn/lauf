import { BasicStore, Immutable } from "@lauf/lauf-store";

interface Fork<Id extends string> {
  id: Id;
  parentId: string;
}

interface Event {
  forkId: string;
  time: number;
  label: string;
}

interface ForkLog {
  forks: {
    [id in string]: Fork<id>;
  };
  events: Event[];
}

const initialState: Immutable<ForkLog> = {
  forks: {},
  events: [],
} as const;

const store = new BasicStore<ForkLog>(initialState);
let nextId = 0;

function doFork(parent: Fork<string>) {
  const childId = (nextId++).toString();
  const state = store.edit((state) => {
    const child: Fork<typeof childId> = {
      id: childId,
      parentId: parent.id,
    };
    state.forks[childId] = child;
  });
  return state.forks[childId];
}
