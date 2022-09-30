import React, { useEffect, useState } from "react";
import { mainPlan } from "../src/logic";
import { Model } from "../src/state";
import { Game } from "../src/ui";

export default function render() {
  const [appModel, setAppModel] = useState<Model>();
  useEffect(() => {
    // create model and launch routines
    const appModel = mainPlan();
    // pass model to renderer
    setAppModel(appModel);
  }, []);
  return appModel ? <Game {...appModel} /> : <p>Loading...</p>;
}
