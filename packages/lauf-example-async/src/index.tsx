import React from "react";
import ReactDOM from "react-dom";
import { executeSequence } from "./lauf/src";
import { createMainSequence, createStore, ensureFocusPosts } from "./domain";
import { App } from "./containers/App";

const store = createStore();
executeSequence(createMainSequence(store));
ReactDOM.render(<App store={store} />, document.getElementById("root"));
