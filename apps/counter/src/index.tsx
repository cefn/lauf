import React from "react";
import ReactDOM from "react-dom";
import { Immutable, Store } from "@lauf/store";
import { useSelected, useStore } from "@lauf/store-react";

interface AppState {
  counter: number;
}

const INITIAL_STATE: Immutable<AppState> = {
  counter: 0,
} as const;

interface StoreProps {
  store: Store<AppState>;
}

const Display = ({ store }: StoreProps) => {
  const counter = useSelected(store, (state) => state.counter);
  return <h1>{counter}</h1>;
};

const Increment = ({ store }: StoreProps) => (
  <button onClick={() => store.edit((draft) => (draft.counter += 1))}>
    Increase
  </button>
);

const Decrement = ({ store }: StoreProps) => (
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
