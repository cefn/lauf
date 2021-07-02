<img src="https://github.com/cefn/lauf/raw/main/vector/logo.png" alt="Logo - Image of Runner" align="left"><br></br>

# Lauf

<sub><sup>Logo - Diego Naive, Noun Project.</sup></sub>
<br></br>

Lauf isolates business logic from UI. It uses a normal Javascript object as a central, reactive [Store](https://www.npmjs.com/package/@lauf/store).

Lauf business logic is explicit, predictable, testable - like a Redux app, but without the boilerplate.

The Counter app demo below uses
[@lauf/store-react](https://github.com/cefn/lauf/tree/main/modules/store-react)
bindings. However, Lauf has no React dependencies and can be used server side or
in any other UI Framework using
[@lauf/store](https://github.com/cefn/lauf/tree/main/modules/store) and
[@lauf/store-follow](https://github.com/cefn/lauf/tree/main/modules/store-follow)

In detail

- `App` calls `useStore` passing `INITIAL_STATE` to initialise the [[Store]] on first load.
- `App` passes the store to three components
- The `Display` React component has a `useSelected` hook to re-render when `counter` changes.
- The `Increment` and `Decrement` buttons don't re-render on any state changes, but they DO trigger an `edit` to the `counter` state when clicked.

See the Counter app running in a sandbox; ([javascript](https://codesandbox.io/s/github/cefn/lauf/tree/main/apps/counter-js)), ([typescript](https://codesandbox.io/s/github/cefn/lauf/tree/main/apps/counter)).

```javascript
const INITIAL_STATE = {
  counter: 0,
};

const Display = ({ store }) => {
  const counter = useSelected(store, (state) => state.counter);
  return <h1>{counter}</h1>;
};

const Increment = ({ store }) => (
  <button onClick={() => store.edit((draft) => (draft.counter += 1))}>
    Increase
  </button>
);

const Decrement = ({ store }) => (
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
```

## Primitives and Utilities

Lauf includes a [Store](https://github.com/cefn/lauf/tree/main/modules/store) for state, a [Message Queue](https://github.com/cefn/lauf/tree/main/modules/queue) for events and a [Mutex or Lock](https://github.com/cefn/lauf/tree/main/modules/lock) to control resource-sharing.

To wire state to business logic, use [Store Follow](https://github.com/cefn/lauf/tree/main/modules/store-follow) to queue up state-changes for your handlers.

To wire state to UI, use [Store React](https://github.com/cefn/lauf/tree/main/modules/store-react) to refresh components only when their bound state changes.

## Getting started

A Create-React-App example is the [Counter app in Typescript](https://github.com/cefn/lauf/tree/main/apps/counter) or [in Javascript](https://github.com/cefn/lauf/tree/main/apps/counter-js) .

A NextJS example is the [Color Mixer in Typescript](https://github.com/cefn/lauf/tree/main/apps/nextjs-mixer).

For an example of complex state management and eventing, see the NextJS [Snake Game in Typescript](https://github.com/cefn/lauf/tree/main/apps/nextjs-snake)

## Lauf vs Redux

Flux-based frameworks like `Redux` or `React.useReducer` will guide you to use an action type, a structured payload definition, probably an Action creator, possibly a thunk creator, with the result sent via a dispatcher to (hopefully) line up with corresponding behaviour in a reducer and probably some middleware.

Lauf aims to avoid all this. Your coding style with Lauf remains simple, procedural and explicit.
