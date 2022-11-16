import React, { useContext } from "react";
import { createStore, Store } from "@lauf/store";
import { History, initHistory, Moment } from "./history";
import { NarrativeOp } from "../narrative";
import { StoryState } from "../../stories/about";

/** Store containing the complete record of commands and transient states to jog through. */
export interface TrackerState {
  history: History<NarrativeOp, StoryState>;
  inspected: {
    momentPos: number;
    momentField: keyof Moment<NarrativeOp, StoryState>;
  } | null;
}

export function createTrackerStore() {
  return createStore<TrackerState>({
    history: initHistory<NarrativeOp, StoryState>(),
    inspected: null,
  });
}

export const TrackerStoreContext =
  React.createContext<Store<TrackerState> | null>(null);

export function useTrackerStore() {
  const trackerStore = useContext(TrackerStoreContext);
  if (!trackerStore) {
    throw new Error("No tracker store available in this context");
  }
  return trackerStore;
}
