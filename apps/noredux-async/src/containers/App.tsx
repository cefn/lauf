import React, { MouseEvent } from "react";
import { Store } from "@lauf/store";
import { useSelected } from "@lauf/store-react";
import {
  SubredditName,
  subredditNames,
  selectFocus,
  selectFocusedCache,
  AppState,
  setFocus,
  fetchFocused
} from "../plans";
import { Picker } from "../components/Picker";
import { Posts } from "../components/Posts";

interface AppParams {
  store: Store<AppState>;
}

export function App({ store }: AppParams) {
  const focused = useSelected(store, selectFocus);
  const cache = useSelected(store, selectFocusedCache);
  const onPickerSelect = (newName: SubredditName) => {
    setFocus(store, newName);
  };
  const onButtonClick = (event: MouseEvent) => {
    event.preventDefault();
    fetchFocused(store);
  };

  let postsPanel;
  if (cache == null) {
    postsPanel = <p>Loading</p>;
  } else {
    const { posts, isFetching, lastUpdated } = cache;
    postsPanel = (
      <>
        <p>
          {lastUpdated && (
            <span>
              Last updated at {new Date(lastUpdated).toLocaleTimeString()}.{" "}
            </span>
          )}
          {!isFetching && <button onClick={onButtonClick}>Refresh</button>}
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
  }

  return (
    <div>
      <Picker
        selectedOption={focused}
        handleChange={onPickerSelect}
        options={[...subredditNames]}
      />
      {postsPanel}
    </div>
  );
}
