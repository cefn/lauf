# 'No Redux' Async App

This app is feature-equivalent to the minimal 'async' example from core Redux documentation. However, it uses no Redux code. It relies instead on...

- [@lauf/store](https://www.npmjs.com/package/@lauf/store) for state management
- [@lauf/store-follow](https://www.npmjs.com/package/@lauf/store-follow) to track selected parts of the state
- and [@lauf/store-react](https://www.npmjs.com/package/@lauf/store-react) to bind React UI elements to state.

It should be compared with the original [example source code](https://github.com/reduxjs/redux/tree/master/examples/async) as linked from the Redux Tutorial. This comparison demonstrates the difference in approach between lauf and Redux.

# Lauf v Redux

Like Redux, application state and behaviour is fully defined in isolation from React. In the app, state and triggers are made available to React through a handful of data bindings and callbacks [shown here](https://github.com/cefn/lauf/blob/1a7008516000a03a4fcda4100202328b392069d9/apps/noredux-async/src/containers/App.tsx#L20-L22). An app implemented in this way is trivial to port to another UI framework.

All logic is encapsulated in a single [plans.ts](https://github.com/cefn/lauf/blob/1a7008516000a03a4fcda4100202328b392069d9/apps/noredux-async/src/plans.ts) file composed of async routines.

# Comparison: Lauf v Redux-Toolkit

Redux-toolkit defines solid conventions to minimise boilerplate and simplify the design of redux-based apps. An aim of lauf is to remove the boilerplate altogether by approaching the core implementation differently, relying on some of the core language capabilities of typescript.
