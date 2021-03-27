import React, { useEffect, useState } from "react";
import { performSequence } from "@lauf/lauf-runner
";
import { mainPlan } from "../src/game";
import { AppModel } from "../src/domain";
import { Game } from "../src/view";

export default function render() {
  const [appModel, setAppModel] = useState<AppModel>();
  useEffect(() => {
    //only launch application client-side
    if (process.browser) {
      (async () => {
        //create model and launch routines
        const appModel = await performSequence(mainPlan());
        //pass model to renderer
        setAppModel(appModel);
      })();
    }
  }, []);
  return appModel ? <Game {...appModel} /> : <p>Loading...</p>;
}
