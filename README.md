<div style="display:block;float:left">
<img src="https://github.com/cefn/lauf/raw/main/vector/logo.png" alt="Logo - Image of Runner"><br>
<sub><sup>Logo - Diego Naive, Noun Project.</sup></sub>
</div>

# Lauf

Lauf is an approach to define your application state and business logic separately from your UI code. It provides utilities to accelerate common patterns, but it could be seen as more of a strategy than a library.

<hr style="display:block;clear:both" >

## Approach

Lauf is structured around a single change in programming pattern compared to everyday procedural code. Instead of directly triggering steps like this...

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

Lauf promotes the adoption of built-in language constructs like classes and generator functions to define actioms and sequence them without unnecessary boilerplate. Like Redux, it addresses concerns of state management, asynchrony, time-travel debugging and testability. However there are no action constants, creators, payloads, dispatchers, middleware, reducers or connectors.

## Getting started

To get started with the approach, read the [introductory tutorial](./docs/index.md)

## Discussion

For a worked example and discussion of comparison with redux, redux-saga and redux-saga-test-plan, see the [Example App Readme](./apps/lauf-example-async/README.md)
