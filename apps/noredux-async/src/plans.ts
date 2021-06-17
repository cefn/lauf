import { Store, Selector, Immutable } from "@lauf/store";
import { edit, follow } from "@lauf/lauf-runner-primitives";
import {
  Action,
  ActionSequence,
  planOfAction,
  performSequence,
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

export const initialAppState: AppState = {
  focus: subredditNames[0],
  caches: {},
} as const;

export const initialCache: Immutable<Cache> = {
  lastUpdated: null,
  isFetching: false,
  posts: [],
} as const;

/** SELECTORS */

export const selectFocus: Selector<AppState, SubredditName> = (state) =>
  state.focus;

export const selectFocusedCache: Selector<AppState, Cache | undefined> = (
  state
) => state.caches[state.focus];

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

export function* mainPlan(store: Store<AppState>): ActionSequence<void, any> {
  yield* follow(store, selectFocus, function* (focus) {
    // invoked on initial value and every subsequent change
    if (focus) {
      const cache = selectFocusedCache(store.read());
      if (!cache?.posts) {
        yield* fetchPlan(store, focus);
      }
    }
  });
}

export function* fetchPlan(
  store: Store<AppState>,
  name: SubredditName
): ActionSequence<void, any> {
  //initialise cache and transition to 'fetching' state
  yield* edit(store, (draft) => {
    draft.caches[name] = {
      ...(draft.caches[name] || (initialCache as Cache)),
      isFetching: true,
    };
  });
  //perform the fetch
  let posts: Post[];
  try {
    posts = yield* fetchSubreddit(name);
  } finally {
    //update cache with results
    yield* edit(store, (draft) => {
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
          ...(draft.caches[name] as Cache),
          isFetching: false,
        };
      }
    });
  }
}

function* setFocusPlan(store: Store<AppState>, focus: SubredditName) {
  yield* edit(store, (draft) => {
    draft.focus = focus;
  });
}

function* fetchFocusedPlan(store: Store<AppState>) {
  const { focus } = store.read();
  if (focus) {
    yield* fetchPlan(store, focus);
  }
}

/** USER INPUTS */

export function triggerSetFocus(store: Store<AppState>, focus: SubredditName) {
  performSequence(setFocusPlan(store, focus));
}

export function triggerFetchFocused(store: Store<AppState>) {
  performSequence(fetchFocusedPlan(store));
}
