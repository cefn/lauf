<img src="https://github.com/cefn/lauf/raw/main/vector/logo.png" alt="Logo - Image of Runner" align="left"><br></br>

# Lauf Store React

<sub><sup>Logo - Diego Naive, Noun Project.</sup></sub>
<br></br>

`@lauf/lauf-store-react` enables React apps to use [@lauf/lauf-store](https://github.com/cefn/lauf/tree/main/modules/lauf-store)
for state-management, providing a simple substitute for Flux/Redux based on
[Immer](https://immerjs.github.io/immer/).

The simple Typescript example below from our [Counter
Example](https://github.com/cefn/lauf/tree/main/apps/counter) shows how
`useSelected` can bind part of a `Store`'s state to a component, and how to
provide controls that change the state.

- `AppState` defines the state structure to be managed by the Store.
- `StoreProps` defines how to pass the `Store` to React components.
- The `Display` React component calls `useSelected` to re-render on changes to the `counter` in the `Store`
- The `Increment` and `Decrement` buttons don't track any changes, but they do trigger an `edit` to the `AppState` when clicked.
- `App` creates the `Store` with `useStore` passing in an `INITIAL_STATE`.
- `App` inserts the three components, passing each one the store to do its work.

```typescript
import React from "react";
import ReactDOM from "react-dom";
import { Store } from "@lauf/lauf-store";
import { useSelected, useStore } from "@lauf/lauf-store-react";

interface AppState {
  counter: number;
}

const INITIAL_STATE: AppState = {
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
  <button
    onClick={() =>
      store.edit((draft) => {
        draft.counter += 1;
      })
    }
  >
    Increase
  </button>
);

const Decrement = ({ store }: StoreProps) => (
  <button
    onClick={() =>
      store.edit((draft) => {
        draft.counter -= 1;
      })
    }
  >
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
