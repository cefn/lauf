<img src="https://github.com/cefn/lauf/raw/main/vector/logo.png" alt="Logo - Image of Runner" align="left"><br></br>

# Lauf

<sub><sup>Logo - Diego Naive, Noun Project.</sup></sub>
<br></br>

The Lauf framework offers a minimal approach to author business logic isolated from your UI.

The approach ensures your business logic is explicit, predictable, inspectable, testable and replayable - like a Redux app, but without the boilerplate.

## Primitives and Utilities

Lauf includes a [Store](./modules/store) for state, a [Message Queue](./modules/queue) for events and a [Mutex or Lock](./modules/lock) to control resource-sharing.

To wire state to business logic, use [Store Follow](./modules/store-follow).

To wire state to UI, use [Store React](./modules/store-react).

## Getting started

A Create-React-App example is the [Counter app in Typescript](https://github.com/cefn/lauf/tree/main/apps/counter) or [in Javascript](https://github.com/cefn/lauf/tree/main/apps/counter-js) .

A NextJS example is the [Color Mixer in Typescript](https://github.com/cefn/lauf/tree/main/apps/nextjs-mixer).

For an example of complex state management and eventing, see the NextJS [Snake Game in Typescript](https://github.com/cefn/lauf/tree/main/apps/nextjs-snake)

## Lauf vs Redux

Flux-based frameworks like `Redux` or `React.useReducer` will guide you to use an action type, a structured payload definition, probably an Action creator, possibly a thunk creator, with the result sent via a dispatcher to (hopefully) line up with corresponding behaviour in a reducer and probably some middleware.

Lauf aims to avoid all this. Your coding style with Lauf remains simple, procedural and explicit.
