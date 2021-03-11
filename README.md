<img src="https://github.com/cefn/lauf/raw/main/vector/logo.png" alt="Logo - Image of Runner" align="left"><br></br>

# Lauf

<sub><sup>Logo - Diego Naive, Noun Project.</sup></sub>
<br></br>

Lauf helps you define your application state and business logic separately from your UI code. It offers Typescript utilities and patterns to control and monitor sequences of actions, and to bind your UI to shared state and application events. Then it steps out of your way.

<hr>

## Approach

Lauf applications are procedural code, but instead of directly triggering steps like...

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

To get started understanding and using the approach, read the [introductory tutorial](./docs/index.md)

## Design

Lauf utilities guide you to use core Typescript language features like classes and generator functions to define actions and sequence them without unnecessary entities and boilerplate.

Our examples demonstrate how adopting the Action pattern can unlock state management, asynchrony, time-travel debugging and testability benefits associated with Redux. Lauf does this without action constants, creators, payloads, dispatchers, middleware, reducers or connectors.

For a worked example and comparison with redux, redux-saga and redux-saga-test-plan, see the [Async App](./apps/lauf-example-async/README.md)

## Primitives

Lauf offers primitives to coordinate shared resources and state between concurrent Action sequences. These include a [Store](./modules/lauf-store), a [Message Queue](./modules/lauf-queue) and a [Mutex or Lock](./modules/lauf-lock). These pure Async implementations have no direct dependencies on Lauf. Their features are shimmed as Actions to use them in ActionSequences via [lauf-runner-primitives](./modules/lauf-runner-primitives).
