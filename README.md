<img src="https://github.com/cefn/lauf/raw/main/vector/logo.png" alt="Logo - Image of Runner" align="left"><br></br>

# Lauf

<sub><sup>Logo - Diego Naive, Noun Project.</sup></sub>
<br></br>

Lauf is a proof-of-concept framework to make sequences of business logic isolated, explicit, predictable, inspectable, testable and replayable - like a Redux app, but without the boilerplate.

A small change in coding style allows Lauf to silently intercept and track significant actions happening in the control flow of your code, (such as awaited Promises, edits to app state or forked processes).

This traceability and debuggability are benefits normally associated with frameworks such as Redux, Redux-Saga, Overmind, MobX, Mobx-State-Tree or RxJS.

To achieve this, reducer-based frameworks like `Redux` or `React.useReducer` will guide you to use an action type, a structured payload definition, probably an Action creator, possibly a thunk creator, with the result sent via a dispatcher to (hopefully) line up with corresponding behaviour in a reducer and probably some middleware.

Lauf aims to avoid all this. Your coding style with Lauf can remain as simple, procedural, explicit and debuggable as `async`/`await`.

<hr>

## Approach

Lauf applications are written like ordinary procedural code, but instead of directly triggering steps like...

```typescript
const foo = getSomething();
const bar = await doThat(foo);
await doTheOther();
```

...we use a delegating `yield*`. This implicitly passes `Actions` to Lauf which inspects and performs the sync or async steps for us...

<!-- prettier-ignore-start -->
```typescript
const foo = yield* getSomething();
const bar = yield* doThat(foo);
yield* doTheOther();
```
<!-- prettier-ignore-end -->

A procedure containing delegating yields is executed by Lauf by passing it to `performSequence`....

```typescript
performSequence(myProcedure());
```

That's it.

## Getting started

To get started understanding and using the approach, read the [introductory tutorial](./docs/tutorial/index.md). Worked examples with eventing and state are the [Snake Game](./apps/nextjs-snake/src/game.ts) or the [Mornington Crescent](./apps/nextjs-mornington/src/tutorial/event/plan.ts) tutorial game. A [clone of Redux's async example app](https://github.com/cefn/lauf/tree/main/apps/noredux-async) clarifies how Lauf differs from Redux, Redux-Saga and Redux-Saga-Test-Plan.

## Primitives

Lauf includes primitives to coordinate shared resources and state between concurrent `ActionSequences`. Currently a [Store](./modules/store) for state, a [Message Queue](./modules/lauf-queue) for events and a [Mutex or Lock](./modules/lauf-lock) to control resource-sharing.

These are minimal Promise-based implementations, independent of [lauf-runner](./modules/lauf-runner) `ActionSequences`. Definitions that wrap these primitive features for `ActionSequences` are distributed in the [lauf-runner-primitives](./modules/lauf-runner-primitives) module.
