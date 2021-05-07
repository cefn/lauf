import React from "react";
import { Store } from "@lauf/lauf-store";
import { useSelected } from "@lauf/lauf-store-react";
import { State } from "../counterPlan";

export function Counter({ store }: { store: Store<State> }) {
  const counter = useSelected(store, (state: State) => state.counter);
  return <p>{counter}</p>;
}
