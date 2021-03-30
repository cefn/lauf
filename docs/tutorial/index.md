To get started straight away, skip to Lesson 1 [Adding a Store to your App](./storeIntroduction.md) or find out more about the lesson structure below.

## Lessons

Each lesson in this series walks through a single development task, taking us closer to a fully-working version of the well-known game [Mornington Crescent](https://wiki.c2.com/?MorningtonCrescent). These examples are implemented using the [React](https://reactjs.org/) framework, although Lauf runs independently of React.

Each of the three sections has two lessons. Each visits progressively more advanced subjects and revolves around a slightly more complex version of the app.

The first lessons help us understand simple apps. The `store_tutorial` app only uses `Store` from the Lauf API. Apps like this have no need for async side-effects or state transition logic.

- Stores
  - Lesson 1 [Adding a Store to your App](./storeIntroduction.md)
  - Lesson 2 [Binding React to your Store](./bindingReact.md)
  - Example Code: [store_tutorial app](../../apps/nextjs-mornington/src/tutorial/store)

More complex apps need to take an approach like `action_tutorial`. This app adds `ActionSequences` to define rich business logic in isolation from the UI.

- Actions
  - Lesson 3 [Defining ActionSequences](./actionPlans.md)
  - Lesson 4 [Defining Actions](./actionClasses.md)
  - Example Code: [action_tutorial app](../../apps/nextjs-mornington/src/tutorial/action)

Finally, most apps will evolve towards the richness of the `event_tutorial` app which adds a `MessageQueue` and async `Actions` to allow external events from users and services to be processed by business logic.

- Events
  - Lesson 5 [Message Queues](./messageQueues.md)
  - Lesson 6 [Defining Async Actions](./asyncActions.md)
  - Example Code: [event_tutorial app](../../apps/nextjs-mornington/src/tutorial/event)

## Running the Example Apps

To run the example apps...

```bash
cd apps/nextjs-mornington
yarn run dev
```

...then visit http://localhost:3000 to navigate to one of the three entry points.

<!--
- Tests
  - Testing ActionSequences
  - Mocking Reactions
- Derived state
  - [Memoization](./memoizedFunctions.md)
  - [Materialization](./materialisedViews.md)
- Testing
  - [Testing ActionPlans using Performers](./unitTesting.md)
  - [Component-testing UI](./componentTesting.md)
-->

<!--
* Performance improvements around Derived State may apply to large apps
  - performance optimisation amd aggressive minimisation of re-calculation and re-rendering.
* Testing approach applies to all apps with ActionSequences
-->
