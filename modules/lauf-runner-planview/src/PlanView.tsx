import React from "react";

import { TrackerState } from "@lauf/lauf-runner-track";
import { Store } from "@lauf/lauf-store";
import { useSelected } from "@lauf/lauf-store-react";

export function PlanView(props: { trackerStore: Store<TrackerState> }) {
  const events = useSelected(props.trackerStore, (state) => state.events);
  return <h1>{events.length}</h1>;
}
