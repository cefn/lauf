import React from "react";
import ReactDOM from "react-dom";
import { executeSequence } from "@lauf/lauf-runner";
import { mainScript, createStore } from "./domain";
import { App } from "./containers/App";

const store = createStore();
executeSequence(mainScript(store));
ReactDOM.render(<App store={store} />, document.getElementById("root"));
