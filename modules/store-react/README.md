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
App](https://github.com/cefn/lauf/tree/main/apps/counter).

The Counter example below shows how `useSelected` binds a selected part of a
`Store`'s state to a component, and how events can `edit` the state.

You can see the app
running in an online sandbox; [in javascript](https://codesandbox.io/s/github/cefn/lauf/tree/main/apps/counter-js),
or [in typescript](https://codesandbox.io/s/github/cefn/lauf/tree/main/apps/counter).

#### App Behaviour

- `AppState` defines the state structure for the Store.
- `StoreProps` passes the `Store` to React components.
- The `Display` React component has a `useSelected` hook to re-render when `counter` changes.
- The `Increment` and `Decrement` buttons don't re-render on any state changes, but they DO trigger an `edit` to the `counter` state when clicked.
- `App` calls `useStore` passing in an `INITIAL_STATE` to initialise a `Store` on first load.
- `App` inserts the three components, passing each one the store to do its work.

```typescript
import React from "react";
import ReactDOM from "react-dom";
import { Store, Immutable } from "@lauf/store";
import { useStore, useSelected } from "@lauf/store-react";

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
```
