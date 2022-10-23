import React from "react";
import ReactDOM from "react-dom/client";
import { promiseEnding } from "@lauf/stepmachine";
import { createStore } from "@lauf/store";
import { launchReader } from "./show/reader";
import { initStoryState, tellStory } from "./tell/story";

const { tell, prompt, View } = launchReader();

const storyStore = createStore(initStoryState());

const endingPromise = promiseEnding(() => tellStory(storyStore, tell, prompt));

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <View />
  </React.StrictMode>
);
