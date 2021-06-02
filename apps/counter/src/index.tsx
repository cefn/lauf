import React, { useState } from "react";
import ReactDOM from "react-dom";
import { Store, BasicStore, Immutable } from "@lauf/lauf-store";
import { useSelected } from "@lauf/lauf-store-react";

interface AppState {
  counter: number;
}

const INITIAL_STATE: Immutable<AppState> = {
  counter: 0
} as const;

type StoreComponent = (props: { store: Store<AppState> }) => React.ReactElement;

const Display: StoreComponent = ({ store }) => {
  const counter = useSelected(store, (state) => state.counter);
  return <h1>{counter}</h1>;
};

const Increment: StoreComponent = ({ store }) => (
  <input
    value="Increase"
    type="button"
    onClick={() =>
      store.edit((draft) => {
        draft.counter += 1;
      })
    }
  />
);

const Decrement: StoreComponent = ({ store }) => (
  <input
    value="Decrease"
    type="button"
    onClick={() =>
      store.edit((draft) => {
        draft.counter -= 1;
      })
    }
  />
);

const App = () => {
  const [store] = useState(() => new BasicStore(INITIAL_STATE));
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
