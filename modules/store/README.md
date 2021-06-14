## State Management for Javascript with Typescript support.

[![codecov](https://codecov.io/gh/cefn/lauf/branch/main/graph/badge.svg?token=H4O0Wmvho5&flag=store)](https://codecov.io/gh/cefn/lauf)

<img src="https://github.com/cefn/lauf/raw/main/vector/logo.png" alt="Logo - Image of Runner" align="left"><br></br>

# Lauf Store

<sub><sup>Logo - Diego Naive, Noun Project.</sup></sub>
<br></br>

### Install

```
npm install @lauf/store --save
```

`@lauf/store` provides a minimal reactive state-management solution, a simple substitute for Flux/Redux based on [Immer](https://immerjs.github.io/immer/).

It is incredibly lightweight and suitable for adoption with almost any server-side or client-side framework in Typescript or Javascript.

A React binding of `@lauf/store` is provided by the [@lauf/store-react](https://www.npmjs.com/package/@lauf/store-react) package.

Browse the [API](https://cefn.com/lauf/api) or see the minimal JS and TS examples inlined below **_without_** React, showing how to define a new application state, track changes and make edits.

### In Javascript

```javascript
const { createStore } = require("@lauf/store");

// Create and initialize a store
const store = createStore({
  roses: "red",
  violets: "blue",
});

// Watch for changes
store.watch(console.log);

// Change the color - this change will automatically call console.log in the next tick, producing
// { roses: 'white', violets: 'blue' }
store.edit((draft) => {
  draft.roses = "white";
});
```

### In Typescript

```typescript
import { createStore, Immutable } from "@lauf/store";

// Define a type for Store state
export type AppState = Record<string, string>;

// Define the initial Store state
const INITIAL_STATE: Immutable<AppState> = {
  roses: "red",
  violets: "blue",
} as const;

// Create and initialize a store
const store = createStore(INITIAL_STATE);

// Watch for changes
store.watch(console.log);

// Change the color - this change will automatically call console.log in the next tick, producing
// { roses: 'white', violets: 'blue' }
store.edit((draft) => {
  draft.roses = "white";
});
```

Visit [@lauf/store-react](https://www.npmjs.com/package/@lauf/store-react) to learn about `useSelected()` which can refresh React components when only a selected part of your state changes.
