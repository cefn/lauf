import { Store, BasicStore, Selector } from "@lauf/lauf-store";
import { Immutable } from "@lauf/lauf-store/types/immutable";
import { editValue, followStoreSelector } from "@lauf/lauf-store-runner";
import {
  Action,
  createActionScript,
  executeProcedure,
} from "@lauf/lauf-runner";
import { CONTINUE } from "@lauf/lauf-store-runner/types";

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

const fetchSubreddit = createActionScript(FetchSubreddit);

/** PROCEDURES */

export function* mainScript(store: Store<AppState>) {
  //Script is called with initial value of selector, and every future change
  //Returns CONTINUE to keep looping
  return yield* followStoreSelector(store, focusSelector, function* (focus) {
    if (focus) {
      const cache = focusedCacheSelector(store.getValue());
      if (!cache?.posts) {
        yield* fetchScript(store, focus);
      }
    }
    return CONTINUE;
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

export function triggerFocus(store: Store<AppState>, name: SubredditName) {
  executeProcedure(function* () {
    yield* editValue(store, (draft) => {
      draft.focus = name;
    });
  });
}

export function triggerFetchFocused(store: Store<AppState>) {
  executeProcedure(function* () {
    const { focus } = store.getValue();
    if (focus) {
      yield* fetchScript(store, focus);
    }
  });
}