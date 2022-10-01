import { Store } from "@lauf/store";
import { followSelector } from "@lauf/store-follow";
import { SubredditName, Post, AppState } from "./state";

async function fetchSubreddit(name: SubredditName): Promise<Post[]> {
  const response = await fetch(`https://www.reddit.com/r/${name}.json`);
  const json = await response.json();
  return json.data.children.map((child: any) => child.data);
}

function setCacheLoading(store: Store<AppState>) {
  const state = store.read();

  const { focus, caches } = state;

  const focusedCache = {
    ...(caches[focus] || {
      posts: [],
      lastUpdated: null,
    }),
    isFetching: true,
    failedFetching: false,
  };

  store.write({
    ...state,
    caches: {
      ...caches,
      [focus]: focusedCache,
    },
  });
}

function setCacheLoaded(store: Store<AppState>, posts: Post[]) {
  const state = store.read();
  const { focus, caches } = state;
  store.write({
    ...state,
    caches: {
      ...caches,
      [focus]: {
        posts,
        lastUpdated: new Date().getTime(),
        isFetching: false,
        failedFetching: false,
      },
    },
  });
}

function setCacheFailed(store: Store<AppState>) {
  const state = store.read();
  const { focus, caches } = state;
  const focusCache = caches[focus];

  store.write({
    ...state,
    caches: {
      ...caches,
      [focus]: {
        ...focusCache,
        isFetching: false,
        failedFetching: true,
      },
    },
  });
}

export async function refreshFocusedSubreddit(store: Store<AppState>) {
  // lazy create cache and
  // assert fetching status
  setCacheLoading(store);

  const { focus } = store.read();

  try {
    // try to retrieve
    const posts = await fetchSubreddit(focus);
    setCacheLoaded(store, posts);
    // populate cache
  } catch (error) {
    // assert failure status
    setCacheFailed(store);
  }
}

export async function trackFocus(store: Store<AppState>) {
  // invokes callback once then on every focus change
  await followSelector(
    store,
    (state) => state.focus,
    async (focus) => {
      if (focus) {
        // retrieve if new focus has empty cache
        const { caches } = store.read();
        if (!caches?.[focus]?.posts) {
          await refreshFocusedSubreddit(store);
        }
      }
    }
  );
}

export function setFocus(store: Store<AppState>, focus: SubredditName) {
  store.write({
    ...store.read(),
    focus,
  });
}
