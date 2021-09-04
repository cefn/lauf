import React from "react";
import ReactDOM from "react-dom";
import { initialAppState } from "./state";
import { trackFocus } from "./plans";
import { App } from "./containers/App";
import { createStore } from "@lauf/store";

// create store
const store = createStore(initialAppState);
// spawn logic to manipulate store
trackFocus(store);
// bind renderer to store
ReactDOM.render(<App store={store} />, document.getElementById("root"));
