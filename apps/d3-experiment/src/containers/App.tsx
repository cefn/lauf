import React, { useEffect, useState } from "react";
import CSS from "csstype";

import { BasicStore } from "@lauf/lauf-store";
import { Tracker } from "@lauf/lauf-runner-track";

import { initialState, countPlan } from "../counterPlan";
import { Counter } from "../components/Counter";
import { TrackLanes } from "../components/TrackLanes";

const splitStyle: CSS.Properties = {
  height: "100%",
  width: "50%",
  position: "fixed",
  overflowX: "hidden",
  zIndex: 1,
  top: 0,
};

export function App() {
  const [store] = useState(() => new BasicStore(initialState));
  const [tracker] = useState(() => new Tracker(store));

  useEffect(() => void tracker.performPlan(countPlan, store), []);

  return (
    <>
      <div style={{ ...splitStyle, left: 0 }}>
        <Counter store={store} />
      </div>
      <div style={{ ...splitStyle, right: 0 }}>
        <TrackLanes tracker={tracker} />
      </div>
    </>
  );
}
