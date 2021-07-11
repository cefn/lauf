import React from "react";
import { useSelected, useStore } from "@lauf/store-react";
import { INITIAL_STATE, increment, decrement } from "./logic";

const Display = ({ store }) => {
  const counter = useSelected(store, (state) => state.counter);
  return <h1>{counter}</h1>;
};

const Increment = ({ store }) => (
  <button onClick={() => increment(store)}>Increase</button>
);

const Decrement = ({ store }) => (
  <button onClick={() => decrement(store)}>Decrease</button>
);

export const App = () => {
  const store = useStore(INITIAL_STATE);
  return (
    <>
      <Display store={store} />
      <Increment store={store} />
      <Decrement store={store} />
    </>
  );
};
