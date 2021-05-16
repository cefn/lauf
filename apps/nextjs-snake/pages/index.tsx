import React, { useEffect, useState } from "react";
import { mainPlan } from "../src/game";
import { AppModel, Direction, GameState, INITIAL_STATE } from "../src/domain";
import { Game } from "../src/view";

import { Tracker } from "@lauf/lauf-runner-track";
import { PlanView } from "@lauf/lauf-runner-planview";
import { BasicStore } from "@lauf/lauf-store/src";
import { BasicMessageQueue } from "@lauf/lauf-queue/src";

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
      <Game {...appModel} />
      <PlanView tracker={tracker} />
    </>
  ) : (
    <p>Loading...</p>
  );
}
