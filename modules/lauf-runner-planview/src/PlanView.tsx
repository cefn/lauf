import React from "react";

import { Tracker } from "@lauf/lauf-runner-track";
import { useSelected } from "@lauf/lauf-store-react";

export function PlanView<AppState>(props: { tracker: Tracker<AppState> }) {
  const {
    tracker: { trackerStore },
  } = props;
  const storeEvents = useSelected(trackerStore, (state) => state.storeEvents);
  const forkHandles = useSelected(trackerStore, (state) => state.forkHandles);
  return (
    <>
      <h1>StoreEvents: {storeEvents.length}</h1>
      {Object.entries(forkHandles).map(([forkId, forkHandle]) => (
        <>
          <h2>{forkId}</h2>
          <p>Actions : {forkHandle.actionEvents.length}</p>
          <p>Reactions : {forkHandle.reactionEvents.length}</p>
        </>
      ))}
    </>
  );
}
