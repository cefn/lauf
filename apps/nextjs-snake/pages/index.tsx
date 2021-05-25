import React, { useEffect, useState } from "react";
import cssType from "csstype";
import { mainPlan } from "../src/game";
import { AppModel, Direction, GameState, INITIAL_STATE } from "../src/domain";
import { Game } from "../src/view";

import { Tracker } from "@lauf/lauf-runner-track";
import { PlanView } from "@lauf/lauf-runner-planview";
import { BasicStore } from "@lauf/lauf-store/src";
import { BasicMessageQueue } from "@lauf/lauf-queue/src";

const splitStyle: cssType.Properties = {
  height: "100%",
  width: "50%",
  position: "fixed",
  overflowX: "hidden",
  zIndex: 1,
  top: 0,
};

export default function render() {
  const [appModel, setAppModel] = useState<AppModel>();
  const [tracker, setTracker] = useState<Tracker<GameState>>();

  useEffect(() => {
    //only launch application if client-side
    if (process.browser) {
      const appModel = {
        gameStore: new BasicStore<GameState>(INITIAL_STATE),
        inputQueue: new BasicMessageQueue<[Direction, boolean]>(),
      } as const;
      const tracker = new Tracker<GameState>(appModel.gameStore);
      setAppModel(appModel);
      setTracker(tracker);
      tracker.performPlan(mainPlan, appModel);
    }
  }, []);

  return appModel && tracker ? (
    <>
      <div style={{ ...splitStyle, left: 0 }}>
        <Game {...appModel} />
      </div>
      <div style={{ ...splitStyle, right: 0 }}>
        <PlanView tracker={tracker} />
      </div>
    </>
  ) : (
    <p>Loading...</p>
  );
}
