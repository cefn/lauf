import React from "react";
import ReactDOM from "react-dom";
import { performSequence } from "@lauf/lauf-runner";
import { mainPlan, createStore } from "./plans";
import { App } from "./containers/App";

const store = createStore();
performSequence(mainPlan(store)); //could better be performPlan(mainPlan, store);
ReactDOM.render(<App store={store} />, document.getElementById("root"));
