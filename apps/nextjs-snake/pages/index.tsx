import React, { useEffect, useState } from "react";
import { mainPlan } from "../src/game";
import { AppModel, createAppModel, GameState } from "../src/domain";
import { Game } from "../src/view";

import { Tracker } from "@lauf/lauf-runner-track";
import { PlanView } from "@lauf/lauf-runner-planview";

export default function render() {
  const [appModel, setAppModel] = useState<AppModel>();
  const [tracker, setTracker] = useState<Tracker<GameState>>();

  useEffect(() => {
    //only launch application client-side
    if (process.browser) {
      (async () => {
        const appModel = createAppModel();
        const { gameStore } = appModel;
        const tracker = new Tracker(gameStore);
        setAppModel(appModel);
        setTracker(tracker);
        //create model and launch routines
        await tracker.performPlan(function* () {
          yield* mainPlan(appModel);
        });
      })();
    }
  }, []);

  return appModel && tracker ? (
    <>
      <Game {...appModel} />
      <PlanView trackerStore={tracker.trackerStore} />
    </>
  ) : (
    <p>Loading...</p>
  );
}
