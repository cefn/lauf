<img src="https://github.com/cefn/lauf/raw/main/vector/logo.png" alt="Logo - Image of Runner" align="left"><br></br>

# Lauf

<sub><sup>Logo - Diego Naive, Noun Project.</sup></sub>
<br></br>

Lauf is a proof-of-concept framework to make business logic isolated, explicit, predictable, inspectable, testable and replayable - like a Redux app, but without the boilerplate.

Flux-based frameworks like `Redux` or `React.useReducer` will guide you to use an action type, a structured payload definition, probably an Action creator, possibly a thunk creator, with the result sent via a dispatcher to (hopefully) line up with corresponding behaviour in a reducer and probably some middleware.

Lauf aims to avoid all this. Your coding style with Lauf remains simple, procedural and explicit.

The Counter app example [in Typescript](./apps/counter) or [in Javascript](./apps/counter-js) is made with Create-React-App.

The Color Mixer example [in Typescript](./apps/nextjs-mixer) is made with NextJS.

For an example of complex state management and eventing, see the Snake example [in Typescript](./apps/nextjs-snake)

## Primitives and Utilities

Lauf includes a [Store](./modules/store) for state, a [Message Queue](./modules/queue) for events and a [Mutex or Lock](./modules/lock) to control resource-sharing.

To wire state to business logic, use [Store Follow](./modules/store-follow).

To wire state to UI, use [Store React](./modules/store-react).

<hr>

## Getting started

To get started understanding and using the approach, read the [introductory tutorial](./docs/tutorial/index.md). Worked examples with eventing and state are the [Snake Game](./apps/nextjs-snake/src/game.ts) or the [Mornington Crescent](./apps/nextjs-mornington/src/tutorial/event/plan.ts) tutorial game. A [clone of Redux's async example app](https://github.com/cefn/lauf/tree/main/apps/noredux-async) clarifies how Lauf differs from Redux, Redux-Saga and Redux-Saga-Test-Plan.
