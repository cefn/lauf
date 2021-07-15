<img src="https://github.com/cefn/lauf/raw/main/vector/logo.png" alt="Logo - Image of Runner" align="left"><br></br>

# Lauf

<sub><sup>Logo - Diego Naive, Noun Project.</sup></sub>
<br></br>

Lauf strictly isolates business logic and state management from UI.

It uses a normal Javascript object as a central, reactive [Store](https://www.npmjs.com/package/@lauf/store).

Lauf business logic is explicit, predictable, testable - like a Redux app, but without the boilerplate.

## Getting started

In the example code below, `logic.js` defines state and state change
definitions while `ui.js` uses those definitions, to create a Counter app.

The `Display` automatically re-renders whenever the counter changes. The
`Increment` and `Decrement` buttons are never re-rendered, but they trigger state
changes on user input.

```javascript
// logic.js
export const INITIAL_STATE = {
  counter: 0,
};

export const increment = (draft) => (draft.counter += 1);

export const decrement = (draft) => (draft.counter -= 1);
```

```javascript
// ui.js
import React from "react";
import { useSelected, useStore } from "@lauf/store-react";
import { INITIAL_STATE, increment, decrement } from "./logic";

const Display = ({ store }) => {
  const counter = useSelected(store, (state) => state.counter);
  return <h1>{counter}</h1>;
};

const Increment = ({ store }) => (
  <button onClick={() => store.edit(increment)}>Increase</button>
);

const Decrement = ({ store }) => (
  <button onClick={() => store.edit(increment)}>Decrease</button>
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
```

You can experiment with the Counter app running in a sandbox;
([javascript version](https://codesandbox.io/s/github/cefn/lauf/tree/main/apps/counter-js)),
([typescript version](https://codesandbox.io/s/github/cefn/lauf/tree/main/apps/counter)).

A more complex business logic example is the [NextJS Snake app](https://codesandbox.io/s/github/cefn/lauf/tree/main/apps/nextjs-snake).
An example incorporating an network API and local cache is our [clone of the Redux Async example](https://codesandbox.io/s/github/cefn/lauf/tree/main/apps/noredux-async). An event queue example is the [Color Mixer](https://github.com/cefn/lauf/tree/main/apps/nextjs-mixer).

Our interactive demos use
[@lauf/store-react](https://github.com/cefn/lauf/tree/main/modules/store-react)
bindings. However, Lauf has no React dependencies and can be used server side or
in any other UI Framework using
[@lauf/store](https://github.com/cefn/lauf/tree/main/modules/store) and
[@lauf/store-follow](https://github.com/cefn/lauf/tree/main/modules/store-follow)

## API Overview

To wire changing state to business logic, use [Store Follow](https://github.com/cefn/lauf/tree/main/modules/store-follow) to queue up state-changes for your handlers.

To wire changing state to UI, use [Store React](https://github.com/cefn/lauf/tree/main/modules/store-react) to refresh components only when their bound state changes.

Lauf utilities include a [Store](https://github.com/cefn/lauf/tree/main/modules/store) for state, a [Message Queue](https://github.com/cefn/lauf/tree/main/modules/queue) for events and a [Mutex or Lock](https://github.com/cefn/lauf/tree/main/modules/lock) to control resource-sharing.

To find out more, visit the [API](https://cefn.com/lauf/api/modules/_lauf_store_react.html)

## Lauf vs Redux

Flux-based frameworks like `Redux` or `React.useReducer` will guide you to use an action type, a structured payload definition, probably an Action creator, possibly a thunk creator, with the result sent via a dispatcher to (hopefully) line up with corresponding behaviour in a reducer and probably some middleware.

Lauf aims to avoid all this. Your coding style with Lauf remains simple, procedural and explicit.
