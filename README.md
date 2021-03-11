# Lauf

![alt text](./vector/logo.png)

Lauf is a distinctive approach for your typescript application to define its application business logic separately from its UI code.

It promotes the adoption of built-in language constructs like classes and generator functions to define state and logic without unnecessary boilerplate.

Lauf addresses the same concerns of explicit state management, asynchrony, time-travel debugging and testability as Flux approaches. However, it avoides action constants, creators, payloads, dispatchers, middleware, reducers, connectors.

## Actions

Lauf is structured around a single change in programming pattern compared to synchronous code. Instead of directly triggering steps like this...

```typescript
doThis();
doThat();
doTheOther();
```

...we define actions that include those steps like this...

```typescript
{
  act: () => {
    doThis();
    doThat();
    doTheOther();
  };
}
```

<!-- prettier-ignore-start -->
<!-- prettier-ignore-end -->

## Getting started

To get started with the approach, read the [introductory tutorial](./docs/index.md)

## Discussion

For a worked example and discussion of comparison with redux, redux-saga and redux-saga-test-plan, see the [Example App Readme](./apps/lauf-example-async/README.md)

<sub><sup>Logo - Diego Naive, Noun Project.</sup></sub>
