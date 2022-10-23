import React from "react";
import ReactDOM from "react-dom/client";
import { createStore } from "@lauf/store";
import { promiseEnding } from "@lauf/stepmachine";
import { launchReader } from "./lib/reader";
import { initStoryState, tellStory } from "./story/about";

/** Present sequential story state progression through a simple UI */

const { tell, prompt, View } = launchReader();

const storyStore = createStore(initStoryState());

function* storyPlan() {
  storyStore.write(initStoryState());
  yield* tellStory(storyStore, tell, prompt);
}

async function repeatStory() {
  for (;;) {
    await promiseEnding(storyPlan);
  }
}

repeatStory();

/** Capture a snapshot for every step */

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <div className="flex flex-row">
      <div className="grid flex-grow card bg-base-300 rounded-box place-items-left w-1/2 h-1/2">
        <View />
      </div>
      <div className="grid flex-grow card bg-base-300 rounded-box place-items-left w-1/2 h-1/2">
        content
      </div>
    </div>
  </React.StrictMode>
);
