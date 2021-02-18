import React from "react";
import ReactDOM from "react-dom";
import { stagePerformance } from "@lauf/lauf-runner";
import { mainScript, createStore } from "./domain";
import { App } from "./containers/App";

const store = createStore();
stagePerformance(mainScript(store));
ReactDOM.render(<App store={store} />, document.getElementById("root"));
