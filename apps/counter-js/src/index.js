import React from "react";
import ReactDOM from "react-dom";
import { useSelected, useStore } from "@lauf/store-react";

const INITIAL_STATE = {
  counter: 0,
};

const Display = ({ store }) => {
  const counter = useSelected(store, (state) => state.counter);
  return <h1>{counter}</h1>;
};

const Increment = ({ store }) => (
  <button onClick={() => store.edit((draft) => (draft.counter += 1))}>
    Increase
  </button>
);

const Decrement = ({ store }) => (
  <button onClick={() => store.edit((draft) => (draft.counter -= 1))}>
    Decrease
  </button>
);

const App = () => {
  const store = useStore(INITIAL_STATE);
  return (
    <>
      <Display store={store} />
      <Increment store={store} />
      <Decrement store={store} />
    </>
  );
};

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById("root")
);
