import { Store } from "@lauf/store";
import { followSelector } from "@lauf/store-follow";
import { SubredditName, Post, AppState, Cache, initialCache } from "./state";

async function fetchSubreddit(name: SubredditName): Promise<Post[]> {
  const response = await fetch(`https://www.reddit.com/r/${name}.json`);
  const json = await response.json();
  return json.data.children.map((child: any) => child.data);
}

export function setFocus({ edit }: Store<AppState>, focus: SubredditName) {
  edit((draft) => {
    draft.focus = focus;
  });
}

export async function trackFocus(store: Store<AppState>) {
  await followSelector(
    store,
    (state) => state.focus,
    async (focus) => {
      // invoked on initial value and every subsequent change
      if (focus) {
        // lazy-load cache
        const { caches } = store.read();
        if (!caches?.[focus]?.posts) {
          await refreshFocusedSubreddit(store);
        }
      }
    }
  );
}

export async function refreshFocusedSubreddit({ read, edit }: Store<AppState>) {
  // check for non-empty focus
  const { focus } = read();
  if (!focus) {
    return;
  }
  // initialise cache for focus, transition to 'fetching' state
  edit((draft) => {
    draft.caches[focus] = {
      ...(draft.caches[focus] || (initialCache as Cache)),
      isFetching: true
    };
  });
  // perform the fetch
  let posts: Post[];
  try {
    posts = await fetchSubreddit(focus);
  } finally {
    // update cache with results
    edit((draft) => {
      if (posts) {
        // save posts and update time, reset fetching status
        draft.caches[focus] = {
          posts,
          lastUpdated: new Date().getTime(),
          isFetching: false
        };
      } else {
        // failed - just reset fetching status
        draft.caches[focus] = {
          ...(draft.caches[focus] as Cache),
          isFetching: false
        };
      }
    });
  }
}
