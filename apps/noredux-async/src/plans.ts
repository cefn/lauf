import { Store, Selector, Immutable } from "@lauf/store";
import { followSelector } from "@lauf/store-follow";

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

async function fetchSubreddit(name: SubredditName): Promise<Post[]> {
  const response = await fetch(`https://www.reddit.com/r/${name}.json`);
  const json = await response.json();
  return json.data.children.map((child: any) => child.data);
}

/** PLANS */

export async function mainPlan(store: Store<AppState>) {
  await followSelector(store, selectFocus, async (focus) => {
    // invoked on initial value and every subsequent change
    if (focus) {
      const cache = selectFocusedCache(store.read());
      if (!cache?.posts) {
        await fetchPlan(store, focus);
      }
    }
  });
}

async function fetchPlan(store: Store<AppState>, name: SubredditName) {
  const { edit } = store;
  //initialise cache and transition to 'fetching' state
  edit((draft) => {
    draft.caches[name] = {
      ...(draft.caches[name] || (initialCache as Cache)),
      isFetching: true,
    };
  });
  //perform the fetch
  let posts: Post[];
  try {
    posts = await fetchSubreddit(name);
  } finally {
    //update cache with results
    edit((draft) => {
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

/** USER INPUTS */

export function setFocus({ edit }: Store<AppState>, focus: SubredditName) {
  edit((draft) => {
    draft.focus = focus;
  });
}

export async function fetchFocused(store: Store<AppState>) {
  const { focus } = store.read();
  if (focus) {
    await fetchPlan(store, focus);
  }
}
