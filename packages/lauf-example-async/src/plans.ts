import { Store, BasicStore, Selector } from "@lauf/lauf-store";
import { Immutable } from "@lauf/lauf-store/types/immutable";
import {
  editValue,
  followStoreSelector,
  CONTINUE,
} from "@lauf/lauf-store-runner";
import {
  Action,
  ActionSequence,
  planOfAction,
  launchSequence,
} from "@lauf/lauf-runner";

/** STORE DEFINITIONS */

export const subredditNames = ["reactjs", "frontend"] as const;
export type SubredditName = typeof subredditNames[number];

export type AppState = {
  focus: SubredditName;
  caches: {
    [key in SubredditName]?: Cache;
  };
};

export type Cache = {
  isFetching: boolean;
  lastUpdated: number | null; //in milliseconds
  posts: Post[];
};

export type Post = { title: string };

export const initialAppState: Immutable<AppState> = {
  focus: subredditNames[0],
  caches: {},
} as const;

export const initialCache: Immutable<Cache> = {
  lastUpdated: null,
  isFetching: false,
  posts: [],
} as const;

export function createStore(): Store<AppState> {
  return new BasicStore<AppState>(initialAppState);
}

/** SELECTORS */

export const selectFocus: Selector<AppState, SubredditName> = (state) =>
  state.focus;

export const selectFocusedCache: Selector<
  AppState,
  Immutable<Cache> | undefined
> = (state) => state.caches[state.focus];

/** ACTIONS */

export class FetchSubreddit implements Action<Post[]> {
  constructor(readonly name: SubredditName) {}
  async act() {
    const response = await fetch(`https://www.reddit.com/r/${this.name}.json`);
    const json = await response.json();
    return json.data.children.map((child: any) => child.data);
  }
}

const fetchSubreddit = planOfAction(FetchSubreddit);

/** PLANS */

export function* mainPlan(store: Store<AppState>): ActionSequence {
  yield* followStoreSelector(store, selectFocus, function* (focus) {
    // invoked on initial value and every subsequent change
    if (focus) {
      const cache = selectFocusedCache(store.getValue());
      if (!cache?.posts) {
        yield* fetchPlan(store, focus);
      }
    }
    return CONTINUE; //signal value defined by followStoreSelector
  });
}

export function* fetchPlan(
  store: Store<AppState>,
  name: SubredditName
): ActionSequence {
  //initialise cache and transition to 'fetching' state
  yield* editValue(store, (draft) => {
    draft.caches[name] = {
      ...(draft.caches[name] || initialCache),
      isFetching: true,
    };
  });
  //perform the fetch
  let posts: Post[];
  try {
    posts = yield* fetchSubreddit(name);
  } finally {
    //update cache with results
    yield* editValue(store, (draft) => {
      if (posts) {
        //save posts and update time, reset fetching status
        draft.caches[name] = {
          posts,
          lastUpdated: new Date().getTime(),
          isFetching: false,
        };
      } else {
        //just reset fetching status
        draft.caches[name] = {
          ...(draft.caches[name] || initialCache),
          isFetching: false,
        };
      }
    });
  }
}

function* setFocusPlan(store: Store<AppState>, focus: SubredditName) {
  yield* editValue(store, (draft) => {
    draft.focus = focus;
  });
}

function* fetchFocusedPlan(store: Store<AppState>) {
  const { focus } = store.getValue();
  if (focus) {
    yield* fetchPlan(store, focus);
  }
}

/** USER INPUTS */

export function triggerSetFocus(store: Store<AppState>, focus: SubredditName) {
  launchSequence(setFocusPlan(store, focus));
}

export function triggerFetchFocused(store: Store<AppState>) {
  launchSequence(fetchFocusedPlan(store));
}
