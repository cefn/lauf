<img src="https://github.com/cefn/lauf/raw/main/vector/logo.png" alt="Logo - Image of Runner" align="left"><br></br>

# Lauf

<sub><sup>Logo - Diego Naive, Noun Project.</sup></sub>
<br></br>

In common with Redux, Redux-Saga, Overmind, MobX, Mobx-State-Tree, RxJS Lauf can intercept and track significant actions (such as those that change app state) from the control flow of your code.

A minor change in coding style, combined with careful use of Typescript language structures, is enough to make logic explicit, predictable, inspectable, testable and replayable, just like a Redux application.

To achieve this, reducer-based frameworks will use an action type, a structured payload definition, probably an Action creator, possibly a thunk creator, with the result sent via a dispatcher to (hopefully) line up with corresponding behaviour in a reducer and probably some middleware.

Lauf aims to avoid all this.

<hr>

## Approach

Lauf applications are written like ordinary procedural code, but instead of directly triggering steps like...

```typescript
const foo = getThat();
const bar = await doThat(foo);
await doTheOther();
```

...we use a delegating `yield*`. This passes `Actions` to Lauf to inspect and perform the sync or async steps for us...

<!-- prettier-ignore-start -->
```typescript
const foo = yield* doThis();
const bar = yield* doThat(foo);
yield * doTheOther();
```
<!-- prettier-ignore-end -->

Once you have a procedure which yields your actions, it can be passed to a Lauf performer like....

```typescript
performSequence(myProcedure());
```

That's it.

## Getting started

To get started understanding and using the approach, read the [introductory tutorial](./docs/tutorial/index.md). Worked examples with eventing and state are the [Snake Game](./apps/nextjs-snake/src/game.ts) or the [Mornington Crescent](./apps/nextjs-mornington/src/tutorial/event/plan.ts) tutorial game. The [clone of Redux's async example app](https://github.com/cefn/lauf/tree/main/apps/lauf-example-async) discusses how Lauf differs from Redux, Redux-Saga, Redux-Saga-Test-Plan.

## Primitives

Lauf includes primitives to coordinate shared resources and state between concurrent `ActionSequences`. Currently a [Store](./modules/lauf-store) for state, a [Message Queue](./modules/lauf-queue) for events and a [Mutex or Lock](./modules/lauf-lock) to control resource-sharing.

These are minimal Promise-based implementations, independent of [lauf-runner](./modules/lauf-runner) `ActionSequences`. Definitions that wrap these primitive features for `ActionSequences` are at [lauf-runner-primitives](./modules/lauf-runner-primitives).
