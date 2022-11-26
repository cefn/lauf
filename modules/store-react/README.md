## Lightweight React Application State Management

[![codecov](https://codecov.io/gh/cefn/lauf/branch/main/graph/badge.svg?token=H4O0Wmvho5&flag=store-react)](https://codecov.io/gh/cefn/lauf)

<img src="https://github.com/cefn/lauf/raw/main/vector/logo.png" alt="Logo - Image of Runner" align="left"><br></br>

# Lauf Store React

<sub><sup>Logo - Diego Naive, Noun Project.</sup></sub>
<br></br>

### Install

```
npm install @lauf/store-react --save
```

`@lauf/store-react` enables React apps to use [@lauf/store](https://www.npmjs.com/package/@lauf/store)
for state-management, providing a simple substitute for Flux/Redux based on
[Immer](https://immerjs.github.io/immer/).

Browse the [API](https://cefn.com/lauf/api/modules/_lauf_store_react.html) or the Typescript example inlined below from our [Counter
App](https://github.com/cefn/lauf/tree/main/apps/counter-react-ts).

The Counter example below shows how `useSelected` binds a selected part of a
`Store`'s state to a component, and how events can `edit` the state.

You can see the app
running in an online sandbox; [in typescript](https://githubbox.com/cefn/lauf/tree/main/apps/counter-react-ts) or [in javascript](https://githubbox.com/cefn/lauf/tree/main/apps/counter-react-js).

#### App Behaviour

- `AppState` defines the state structure for the Store.
- `StoreProps` passes the `Store` to React components.
- The `Display` React component has a `useSelected` hook to re-render when `counter` changes.
- The `Increment` and `Decrement` buttons don't re-render on any state changes, but they DO trigger a `write` to the `counter` state when clicked.
- `App` calls `useStore` passing in an `INITIAL_STATE` to initialise a `Store` on first load.
- `App` inserts the three components, passing each one the store to do its work.

```typescript
// logic.ts
import { Immutable, Store } from "@lauf/store";

export interface AppState {
  counter: number;
}

export const INITIAL_STATE: Immutable<AppState> = {
  counter: 0,
} as const;

export function increment(store: Store<AppState>) {
  const { counter } = store.read();
  store.write({
    counter: counter + 1,
  });
}

export function decrement(store: Store<AppState>) {
  const { counter } = store.read();
  store.write({
    counter: counter - 1,
  });
}
```

```typescript
// ui.ts
import React from "react";
import { Store } from "@lauf/store";
import { useSelected, useStore } from "@lauf/store-react";
import { AppState, INITIAL_STATE, decrement, increment } from "./logic";

interface StoreProps {
  store: Store<AppState>;
}

export const Display = ({ store }: StoreProps) => {
  const counter = useSelected(store, (state) => state.counter);
  return <h1>{counter}</h1>;
};

export const IncreaseButton = ({ store }: StoreProps) => (
  <button onClick={() => increment(store)}>Increase</button>
);

export const DecreaseButton = ({ store }: StoreProps) => (
  <button onClick={() => decrement(store)}>Decrease</button>
);

export const App = () => {
  const store = useStore(INITIAL_STATE);
  return (
    <>
      <Display store={store} />
      <IncreaseButton store={store} />
      <DecreaseButton store={store} />
    </>
  );
};
```
