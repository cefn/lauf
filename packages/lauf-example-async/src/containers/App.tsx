import React, { MouseEvent } from "react";
import { executeSequence } from "@lauf/lauf-runner";
import { Store } from "@lauf/lauf-store";
import { Picker } from "../components/Picker";
import { Posts } from "../components/Posts";
import {
  SubredditName,
  subredditNames,
  focusedSelector,
  cacheSelector,
  focus,
  syncFocused,
  AppState,
} from "../domain";
import { useSelected, useStore } from "@lauf/lauf-store-react";

type AppParams = {
  store: Store<AppState>;
};

export function App({ store }: AppParams) {
  const focused = useSelected(store, focusedSelector);
  const cache = useSelected(store, cacheSelector);

  const triggerSubredditFocus = (newName: SubredditName) => {
    executeSequence(focus(store, newName));
  };

  const triggerSubredditSync = (event: MouseEvent) => {
    event.preventDefault();
    executeSequence(syncFocused(store));
  };

  let cachePane;
  if (cache) {
    const { posts, isFetching, lastUpdated } = cache;
    cachePane = (
      <>
        <p>
          {lastUpdated && (
            <span>
              Last updated at {new Date(lastUpdated).toLocaleTimeString()}.{" "}
            </span>
          )}
          {!isFetching && (
            <button onClick={triggerSubredditSync}>Refresh</button>
          )}
        </p>
        {posts.length === 0 ? (
          isFetching ? (
            <h2>Loading...</h2>
          ) : (
            <h2>Empty.</h2>
          )
        ) : (
          <div style={{ opacity: isFetching ? 0.5 : 1 }}>
            <Posts posts={posts} />
          </div>
        )}
      </>
    );
  } else {
    cachePane = <p>Loading</p>;
  }

  return (
    <div>
      <Picker
        selectedOption={focused}
        handleChange={triggerSubredditFocus}
        options={[...subredditNames]}
      />
      {cachePane}
    </div>
  );
}
