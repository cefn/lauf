# Lightweight Application Update Framework

`@lauf/store` provides a minimal reactive state-management solution. It can replace Redux, MobX, Xstate, Unstated, Constate in your app in the most delightful way.

<img src="https://github.com/cefn/lauf/raw/main/vector/logo.png" alt="Logo - Image of Runner" ><br></br>

<sub><sup>Logo - Diego Naive, Noun Project.</sup></sub>
<br></br>

[![codecov](https://codecov.io/gh/cefn/lauf/branch/main/graph/badge.svg?token=H4O0Wmvho5&flag=store)](https://codecov.io/gh/cefn/lauf)

### Install

```
npm install @lauf/store --save
```

`@lauf/store` is incredibly lightweight and suitable for adoption with almost any server-side or client-side framework in Typescript or Javascript.

- [Immutable Update patterns](https://redux.js.org/usage/structuring-reducers/immutable-update-patterns) are avoided with [@lauf/store-edit](https://www.npmjs.com/package/@lauf/store-edit) based on Immer.
- Framework-independent bindings to track changes in `@lauf/store` are provided by [@lauf/store-follow](https://www.npmjs.com/package/@lauf/store-follow).
- React bindings to track changes in `@lauf/store` are provided by [@lauf/store-react](https://www.npmjs.com/package/@lauf/store-react).

Browse the [API](https://cefn.com/lauf/api/modules/_lauf_store.html) or see the minimal JS and TS examples inlined below **_without_** React or Async, showing the fundamentals of defining a new application state, tracking changes and making edits.

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
store.write({
  ...store.read(),
  roses: "white",
});
```

Because Store is defined as having an Immutable state, Typescript editors will automatically warn you if you fail to correctly follow [Immutable Update patterns](https://redux.js.org/usage/structuring-reducers/immutable-update-patterns).

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
store.write({
  ...store.read(),
  roses: "white",
});
```

It is recommended for Javascript coders to use [@lauf/store-edit](https://www.npmjs.com/package/@lauf/store-edit) since their editor may not assist them in following [Immutable Update patterns](https://redux.js.org/usage/structuring-reducers/immutable-update-patterns).

## Editors and Selectors

Visit [@lauf/store-edit](https://www.npmjs.com/package/@lauf/store-edit) to learn about `edit()` which eliminates the need to use [Immutable Update patterns](https://redux.js.org/usage/structuring-reducers/immutable-update-patterns).

Visit [@lauf/store-react](https://www.npmjs.com/package/@lauf/store-react) to learn about `useSelected()` which can refresh React components when only a selected part of your state changes.
