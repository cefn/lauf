<img src="https://github.com/cefn/lauf/raw/main/vector/logo.png" alt="Logo - Image of Runner" align="left"><br></br>

# Lauf

<sub><sup>Logo - Diego Naive, Noun Project.</sup></sub>
<br></br>

Lauf can define your application state and business logic separately from your UI code, like Redux.

It offers Typescript utilities and patterns to control and monitor event sequences and immutable state.

Then it steps out of your way.

<hr>

## Approach

Lauf is structured around a single change in programming convention compared to everyday procedural code. Instead of directly triggering steps like this...

```typescript
doThis();
doThat();
doTheOther();
```

...we define an action containing those steps...

```typescript
{
  act: () => {
    doThis();
    doThat();
    doTheOther();
  };
}
```

Lauf promotes the adoption of built-in language constructs like classes and generator functions to define actions and sequence them without unnecessary boilerplate.

The project demonstrates how this single change can achieve equivalent benefits of state management, asynchrony, time-travel debugging and testability that comes with Redux. However, Lauf does this without action constants, creators, payloads, dispatchers, middleware, reducers or connectors.

## Getting started

To get started with the approach, read the [introductory tutorial](./docs/index.md)

## Demonstration

For a worked example and comparison with redux, redux-saga and redux-saga-test-plan, see the [Example App](./apps/lauf-example-async/README.md)
