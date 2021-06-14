## State Management for Javascript with Typescript support.

<img src="https://github.com/cefn/lauf/raw/main/vector/logo.png" alt="Logo - Image of Runner" align="left"><br></br>

# Lauf Store

<sub><sup>Logo - Diego Naive, Noun Project.</sup></sub>
<br></br>

[![codecov](https://codecov.io/gh/cefn/lauf/branch/main/graph/badge.svg?token=H4O0Wmvho5&flag=lauf-store)](https://codecov.io/gh/cefn/lauf)

`@lauf/lauf-store` provides a minimal reactive state-management solution, a simple substitute for Flux/Redux based on [Immer](https://immerjs.github.io/immer/).

It is incredibly lightweight and suitable for adoption with almost any server-side or client-side framework in Typescript or Javascript.

Browse the [API](https://cefn.com/lauf/api) or see the minimal Typescript example inlined below **_without_** React, showing how to define a new application state, track changes and make edits.

A React binding of `@lauf/lauf-store` is provided by the [@lauf/lauf-store-react](https://www.npmjs.com/package/@lauf/lauf-store-react) package.

```typescript
import { createStore, Immutable } from "@lauf/lauf-store";

// Define a type for Store state
export interface AppState {
  color: [number, number, number];
}

// Define the initial Store state
const INITIAL_STATE: Immutable<AppState> = {
  color: [0, 0, 0],
} as const;

// Create and initialize a store
const store = createStore(INITIAL_STATE);

// Watch for changes
store.watch(console.log);

// Change the color - this will automatically call console.log and print the modified app state
store.edit((draft) => {
  draft.color = [255, 0, 0];
});
```

Visit [@lauf/lauf-store-react](https://www.npmjs.com/package/@lauf/lauf-store-react) to learn about `useSelected()` which can refresh React components when only a selected part of your state changes.
