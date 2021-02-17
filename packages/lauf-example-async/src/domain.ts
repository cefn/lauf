import { Store, BasicStore, Selector } from "@lauf/lauf-store";
import { Immutable } from "@lauf/lauf-store/types/immutable";
import { editValue, followValue } from "@lauf/lauf-store-runner";
import {
  Action,
  createActionProcedure,
  executeRootProcedure,
} from "@lauf/lauf-runner";

/** STORE DEFINITION */

export const subredditNames = ["reactjs", "frontend"] as const;
export type SubredditName = typeof subredditNames[number];

export type AppState = {
  focus: SubredditName;
  caches: {
    [key in SubredditName]?: Cache;
  };
};

export type Cache = {
  posts: Post[];
  lastUpdated: null | number; //in milliseconds
  isFetching: boolean;
};

export type Post = { title: string };

export const initialAppState: AppState = {
  focus: subredditNames[0],
  caches: {},
} as const;

const initialCache: Immutable<Cache> = {
  lastUpdated: null,
  isFetching: false,
  posts: [],
} as const;

export function createStore(): Store<AppState> {
  return new BasicStore<AppState>(initialAppState);
}

/** SELECTORS */

export const focusSelector: Selector<AppState> = (state) => state.focus;
export const focusedCacheSelector: Selector<AppState> = (state) =>
  state.caches[state.focus];

/** ASYNC ACTIONS */

class FetchSubreddit implements Action<Post[]> {
  constructor(readonly name: SubredditName) {}
  async act() {
    const response = await fetch(`https://www.reddit.com/r/${this.name}.json`);
    const json = await response.json();
    return json.data.children.map((child: any) => child.data);
  }
}

const fetchSubreddit = createActionProcedure(FetchSubreddit);

/** PROCEDURES */

export function* mainScript(store: Store<AppState>) {
  yield* followValue(store, focusSelector, function* (focus) {
    if (focus) {
      const cache = focusedCacheSelector(store.getValue());
      if (!cache?.posts) {
        yield* fetchScript(store, focus);
      }
    }
    return false;
  });
}

export function* fetchScript(store: Store<AppState>, focused: SubredditName) {
  //initialise cache and transition to 'fetching' state
  yield* editValue(store, (draft) => {
    draft.caches[focused] = {
      ...(draft.caches[focused] || initialCache),
      isFetching: true,
    };
  });
  //perform the fetch
  const posts = yield* fetchSubreddit(focused);
  //update the cache with the results
  const lastUpdated = new Date().getTime();
  const isFetching = false;
  yield* editValue(store, (draft) => {
    draft.caches[focused] = {
      posts,
      lastUpdated,
      isFetching,
    };
  });
}

/** USER INPUTS */

export function focusSubreddit(store: Store<AppState>, name: SubredditName) {
  executeRootProcedure(function* () {
    yield* editValue(store, (draft) => {
      draft.focus = name;
    });
  });
}

export function refreshFocusedSubreddit(store: Store<AppState>) {
  executeRootProcedure(function* () {
    const { focus } = store.getValue();
    if (focus) {
      yield* fetchScript(store, focus);
    }
  });
}
