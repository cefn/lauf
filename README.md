# Lauf

![alt text](./vector/logo.png)

<sub><sup>Logo - Diego Naive, Noun Project.</sup></sub>

Lauf is a distinctive approach for your typescript application to define its application business logic separately from its UI code. It provides utilities to accelerate common patterns, but it could be seen as more of a strategy than a library.

Lauf promotes the adoption of built-in language constructs like classes and generator functions to define state and logic without unnecessary boilerplate. It addresses the same concerns of explicit state management, asynchrony, time-travel debugging and testability as Flux approaches. However, it avoids action constants, creators, payloads, dispatchers, middleware, reducers, connectors.

## Approach

Lauf is structured around a single change in programming pattern compared to everyday procedural code. Instead of directly triggering steps like this...

```typescript
doThis();
doThat();
doTheOther();
```

...we define an action with those steps like this...

```typescript
{
  act: () => {
    doThis();
    doThat();
    doTheOther();
  };
}
```

## Getting started

To get started with the approach, read the [introductory tutorial](./docs/index.md)

## Discussion

For a worked example and discussion of comparison with redux, redux-saga and redux-saga-test-plan, see the [Example App Readme](./apps/lauf-example-async/README.md)
