import React, { MouseEvent } from "react";
import { Store } from "@lauf/store";
import { useSelected } from "@lauf/store-react";
import { SubredditName, subredditNames, AppState } from "../state";
import { setFocus, refreshFocusedSubreddit } from "../plans";
import { Picker } from "../components/Picker";
import { Posts } from "../components/Posts";

interface AppParams {
  store: Store<AppState>;
}

const focusSelector = (state: AppState) => state.focus;
const cacheSelector = (state: AppState) => state.caches[state.focus];

export function App({ store }: AppParams) {
  const focus = useSelected(store, focusSelector);
  const cache = useSelected(store, cacheSelector);

  const onPickerSelect = (newName: SubredditName) => {
    setFocus(store, newName);
  };
  const onButtonClick = (event: MouseEvent) => {
    event.preventDefault();
    refreshFocusedSubreddit(store);
  };

  let postsPanel;
  if (cache == null) {
    postsPanel = <p>Initialising...</p>;
  } else {
    const { posts, isFetching, failedFetching, lastUpdated } = cache;
    postsPanel = (
      <>
        <p>
          {lastUpdated && (
            <span>
              Last updated at {new Date(lastUpdated).toLocaleTimeString()}.{" "}
            </span>
          )}
          {failedFetching && <span>Last refresh failed.</span>}
          {!isFetching && <button onClick={onButtonClick}>Refresh</button>}
        </p>
        {posts.length === 0 ? (
          isFetching ? (
            <h2>Refreshing...</h2>
          ) : (
            <p>No posts available.</p>
          )
        ) : (
          <div style={{ opacity: isFetching ? 0.5 : 1 }}>
            <Posts posts={posts} />
          </div>
        )}
      </>
    );
  }

  return (
    <div>
      <Picker
        selectedOption={focus}
        handleChange={onPickerSelect}
        options={[...subredditNames]}
      />
      {postsPanel}
    </div>
  );
}
