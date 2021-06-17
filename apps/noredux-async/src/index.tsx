import React from "react";
import ReactDOM from "react-dom";
import { performSequence } from "@lauf/lauf-runner";
import { mainPlan, initialAppState } from "./plans";
import { App } from "./containers/App";
import { createStore } from "@lauf/store";

const store = createStore(initialAppState);
performSequence(mainPlan(store));
ReactDOM.render(<App store={store} />, document.getElementById("root"));
