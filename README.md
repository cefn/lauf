<img src="https://github.com/cefn/lauf/raw/main/vector/logo.png" alt="Logo - Image of Runner" align="left"><br></br>

# Lauf

<sub><sup>Logo - Diego Naive, Noun Project.</sup></sub>
<br></br>

Lauf helps you define your application state and business logic separately from your UI code. It can be used in the place of Redux and Redux-Saga to provide state-management and coordinate async procedures.

Lauf offers Typescript utilities and patterns to control and monitor sequences of actions, and to bind your UI to shared state and application events. Then it steps out of your way.

<hr>

## Approach

Lauf applications are written like ordinary procedural code, but instead of directly triggering steps like...

```typescript
doThis();
doThat();
doTheOther();
```

...we yield an action containing those steps which looks like...

```typescript
{
  act: () => {
    doThis();
    doThat();
    doTheOther();
  };
}
```

That's it.

Once you have a procedure which yields your actions, it can be passed to a Lauf performer like....

```typescript
performSequence(myProcedure());
```

## Getting started

To get started understanding and using the approach, read the [introductory tutorial](./docs/index.md). A worked example with eventing and state is the [Snake Game](https://github.com/cefn/lauf/blob/main/apps/nextjs-snake/src/game.ts). The [clone of Redux's async example app](https://github.com/cefn/lauf/tree/main/apps/lauf-example-async) illustrates how Lauf differs from Redux, Redux-Saga, Redux-Saga-Test-Plan.

## Design

Lauf utilities guide you to use core Typescript language features like classes and generator functions to define actions and sequence them without unnecessary entities and boilerplate.

Our examples demonstrate how adopting the yield-Action pattern can unlock state management, asynchrony, time-travel debugging and testability benefits associated with Redux. Lauf does this without action constants, creators, payloads, dispatchers, middleware, reducers or connectors.

## Primitives

Lauf includes primitives to coordinate shared resources and state between concurrent Action sequences. Currently a [Store](./modules/lauf-store) for state, a [Message Queue](./modules/lauf-queue) for events and a [Mutex or Lock](./modules/lauf-lock) to control resource-sharing. 

These are minimal Promise-based implementations, independent of the yield-action pattern. Lauf Action definitions wrapping these primitive features for [lauf-runner](./modules/lauf-runner) are at [lauf-runner-primitives](./modules/lauf-runner-primitives).
