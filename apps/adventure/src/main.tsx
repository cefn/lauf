import React from "react";
import ReactDOM from "react-dom/client";
import { createStore } from "@lauf/store";
import { launchReader } from "./lib/reader";
import { initStoryState, tellStory } from "./stories/about";
import { initHistory, launchTracker, trackStory } from "./lib/tracker";

/** Present sequential story state progression through a simple UI */

const { tell, prompt, View } = launchReader();

const storyStore = createStore(initStoryState());

function* storyPlan() {
  storyStore.write(initStoryState());
  yield* tellStory(storyStore, tell, prompt);
}

/** Perform sequence while recording execution. */

const { HistoryView, InspectedView } = launchTracker(storyStore, storyPlan);

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <div className="flex flex-row">
      <div className="grid flex-grow card bg-base-300 rounded-box place-items-left w-1/2 h-1/2">
        <View />
      </div>
      <div className="flex flex-col bg-base-300 rounded-box place-items-left w-full">
        <div className="h-1/2">
          <HistoryView />
        </div>
        <div className="h-1/2">
          <InspectedView />
        </div>
      </div>
    </div>
  </React.StrictMode>
);
