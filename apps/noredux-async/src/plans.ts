import { Store } from "@lauf/store";
import { followSelector } from "@lauf/store-follow";
import { SubredditName, Post, AppState } from "./state";

async function fetchSubreddit(name: SubredditName): Promise<Post[]> {
  const response = await fetch(`https://www.reddit.com/r/${name}.json`);
  const json = await response.json();
  return json.data.children.map((child: any) => child.data);
}

export async function refreshFocusedSubreddit({ read, edit }: Store<AppState>) {
  const { focus } = read();

  // lazy create cache
  // assert fetching status
  edit(({ caches }) => {
    caches[focus] = {
      ...(caches[focus] || {
        posts: [],
        lastUpdated: null
      }),
      isFetching: true,
      failedFetching: false
    };
  });

  try {
    // try to retrieve
    const posts = await fetchSubreddit(focus);
    // populate cache
    edit(({ caches }) => {
      caches[focus] = {
        posts,
        lastUpdated: new Date().getTime(),
        isFetching: false,
        failedFetching: false
      };
    });
  } catch (error) {
    // assert failure status
    edit(({ caches }) => {
      caches[focus].isFetching = false;
      caches[focus].failedFetching = true;
    });
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

export function setFocus({ edit }: Store<AppState>, focus: SubredditName) {
  edit((draft) => {
    draft.focus = focus;
  });
}
