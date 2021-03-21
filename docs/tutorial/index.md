To get started straight away, skip to Lesson 1 [Adding a Store to your App](./storeIntroduction.md) or find out more about the lesson structure below.

Note: The worked examples use React as the reference UI library. However, Lauf has no direct dependencies on React and could be used with other frameworks.

## Lessons

Each lesson in this series walks through a single development task, taking us closer to a fully-working version of the well-known game [Mornington Crescent](https://www.amazon.co.uk/Little-Book-Mornington-Crescent/dp/0752844229) implemented using the [React](https://reactjs.org/) framework.

Each of the three sections has two lessons. Each visits progressively more advanced subjects and revolves around a slightly more advanced version of the app.

Very simple apps could be built like `store_tutorial` using a `Store` for state only, assuming they need no async side-effects or state transition logic.

- Stores
  - Lesson 1 [Adding a Store to your App](./storeIntroduction.md)
  - Lesson 2 [Binding React to your Store](./bindingReact.md)
  - Example Code: [store_tutorial app](../../apps/nextjs-mornington/src/tutorial/store)

More complex apps could be built like `action_tutorial` just with a `Store` for state and `ActionSequences` to define rich business logic in isolation from the UI.

- Actions
  - Lesson 3 [Defining ActionSequences](./actionPlans.md)
  - Lesson 4 [Defining Actions](./actionClasses.md)
  - Example Code: [action_tutorial app](../../apps/nextjs-mornington/src/tutorial/action)

Most apps will evolve towards `event_tutorial`, with a `Store` for state, `ActionSequences` for business logic and a `MessageQueue` plus async `Actions` to handle external events from users or services.

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
