import React from "react";
import ReactDOM from "react-dom/client";
import { createStore } from "@lauf/store";
import { launchReader } from "./lib/reader";
import { initStoryState, tellStory } from "./stories/about";
import { createTrackerStore, TrackerStoreContext } from "./lib/tracker/store";
import { launchTracker } from "./lib/tracker/launch";
import { TrackerHistoryView } from "./lib/tracker/components/TrackerHistoryView";
import { TrackerInspectedView } from "./lib/tracker/components/TrackerInspectedView";

/** Present sequential story state progression through a simple UI */

const { tell, prompt, View } = launchReader();

const storyStore = createStore(initStoryState());

function* storyPlan() {
  storyStore.write(initStoryState());
  yield* tellStory(storyStore, tell, prompt);
}

/** Perform sequence while viewing execution through tracker. */
const trackerStore = createTrackerStore();
launchTracker(trackerStore, storyStore, storyPlan);

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <TrackerStoreContext.Provider value={trackerStore}>
      <div className="flex flex-row">
        <div className="flex flex-col bg-base-300 rounded-box place-items-left w-1/2 h-full">
          <View />
        </div>
        <div className="flex flex-col bg-base-300 rounded-box place-items-left w-1/2">
          <div className="h-1/2 overflow-y-scroll">
            <TrackerHistoryView />
          </div>
          <div className="h-1/2">
            <TrackerInspectedView />
          </div>
        </div>
      </div>
    </TrackerStoreContext.Provider>
  </React.StrictMode>
);
