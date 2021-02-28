import React from "react";
import ReactDOM from "react-dom";
import { launchSequence } from "@lauf/lauf-runner";
import { mainPlan, createStore } from "./plans";
import { App } from "./containers/App";

const store = createStore();
launchSequence(mainPlan(store));
ReactDOM.render(<App store={store} />, document.getElementById("root"));
