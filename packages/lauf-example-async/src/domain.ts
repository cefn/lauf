import { Action, createActionProcedure, wait } from "@lauf/lauf-runner";
import { Store, BasicStore } from "@lauf/lauf-store";
import { editValue } from "@lauf/lauf-store-runner";
import { Immutable } from "@lauf/lauf-store/types/immutable";

/** STORE DEFINITION */

export type Post = { title: string };

export type Cache = {
  posts: Post[];
  lastUpdated: null | number; //in milliseconds
  isFetching: boolean;
};

export type AppState = {
  focused: SubredditName;
  caches: {
    [key in SubredditName]?: Cache;
  };
};

export type SubredditName = typeof subredditNames[number];

export const subredditNames = ["reactjs", "frontend"] as const;

export const initialAppState: AppState = {
  focused: subredditNames[0],
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

export const focusedSelector = (state: Immutable<AppState>) => state.focused;
export const cacheSelector = (state: Immutable<AppState>) =>
  state.caches[state.focused];

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

export function* focus(store: Store<AppState>, name: SubredditName) {
  yield* editValue(store, (draft) => {
    draft.focused = name;
  });
}

export function* ensureFocusPosts(store: Store<AppState>) {
  let prevFocused = undefined;
  let nextFocused = focusedSelector(store.getValue());
  const unwatch = store.watch((state) => {
    nextFocused = focusedSelector(state);
  });
  try {
    while (true) {
      //handle possible focus change
      if (nextFocused != prevFocused) {
        if (nextFocused) {
          yield* ensurePosts(store, nextFocused);
        }
      }
      //block until possible focus change
      yield* wait(
        new Promise<void>((resolve) => {
          const localunwatch = store.watch(() => {
            localunwatch();
            resolve();
          });
        })
      );
    }
  } finally {
    unwatch();
  }
}

export function* syncFocused(store: Store<AppState>) {
  const { focused } = store.getValue();
  if (focused) {
    yield* syncPosts(store, focused);
  }
}

export function* ensurePosts(store: Store<AppState>, focused: SubredditName) {
  const cache = cacheSelector(store.getValue());
  if (!cache?.posts) {
    yield* syncPosts(store, focused);
  }
}

export function* syncPosts(store: Store<AppState>, focused: SubredditName) {
  yield* editValue(store, (draft) => {
    draft.caches[focused] = {
      ...(draft.caches[focused] || initialCache),
      isFetching: true,
    };
  });
  const posts = yield* fetchSubreddit(focused);
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

/** RUN */

export function* createMainSequence(store: Store<AppState>) {
  yield* ensureFocusPosts(store);
}
