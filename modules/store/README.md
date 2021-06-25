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

Framework-independent async bindings for `@lauf/store` are provided by [@lauf/store-follow](https://www.npmjs.com/package/@lauf/store-follow).

React bindings for `@lauf/store` are provided by [@lauf/store-react](https://www.npmjs.com/package/@lauf/store-react).

Browse the [API](https://cefn.com/lauf/api/modules/_lauf_store.html) or see the minimal JS and TS examples inlined below **_without_** React or Async, showing the fundamentals of defining a new application state, tracking changes and making edits.

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
