# Example Async App

The lauf project provides a proof-of-concept replacement for redux, redux-saga and redux-saga-test-plan for typescript. It is designed to address the same concerns of explicit state management, asynchrony, time-travel debugging and testability.

This app is feature-equivalent to the minimal 'async' example from core Redux documentation. However, it uses no Redux code. It relies instead on [@lauf/lauf-runner](https://github.com/cefn/lauf/tree/main/modules/lauf-runner) to define and execute 'plans' taking advantage of simple primitives such as store, queue and lock from the [lauf](https://github.com/cefn/lauf/) project.

It should be compared with the original [example source code](https://github.com/reduxjs/redux/tree/master/examples/async) as linked from the Redux Tutorial. This comparison demonstrates the difference in approach between lauf and Redux.

# Lauf v Redux

Lauf ActionPlans define steps that the app should take. Beginning an ActionPlan creates an ActionSequence, which keeps track of progress through the plan. The ActionSequence responds to user interactions and results from asynchronous services. Sequential logic and synchronization points between parallel plans are explicit, visible and controllable.

Like Redux, application state and behaviour is fully defined in isolation from React. In the app, state and triggers are 'rendered' to React through a handful of data bindings and callbacks [shown here](https://github.com/cefn/lauf/blob/main/apps/noredux-async/src/containers/App.tsx#L21-L29). An app implemented in this way should be trivial to port to another UI framework, using the same bindings.

By contrast with Redux, all logic is encapsulated in a single, time-travel-debuggable and testable [plans.ts](https://github.com/cefn/lauf/blob/main/apps/noredux-async/src/plans.ts) file composed of plan co-routines.

To run a lauf app, a main 'action plan' co-routine is launched, which may delegate to other co-routines or spawn worker co-routines in parallel. Each task is authored as an explicit sequential procedure. Redux recommends tracking progress through explicit Action notifications to a shared reducer meaning task tracing is hard. However, in Lauf a task is implicitly tracked by the paused state of each plan's co-routine while it awaits its next result and progresses towards an outcome. In this way tasks can be read and debugged as code.

# Lauf v Redux-Saga

Like Redux-Saga, lauf uses co-routines to define sequences of asynchronous operations using the `yield` keyword, pausing the routine then resuming when the operation has completed.

However, in lauf, yielded `Action` objects are 'imperative'. They directly include some operation that changes app state, which can be understood directly as code. This contrasts with Redux's declarative actions with their factory functions and later mapping and decoding through a reducer. To add an asynchronous task to redux-saga typically means isolated code in at least three places - an Action name constant, Action creator definition and a Reducer. This indirection has to be mentally traced by the developer. In lauf an Action is any object with an `act` method.

Unlike redux-saga which uses `yield`, outcomes in lauf use [generator delegation](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/yield*) and the `yield*` construct. In this way, the return type is explicit and is trivially bound by the typescript compiler to match the return type of the operation itself.

For example this line in the `fetch` plan hands over control to the `fetchSubreddit` plan which has an explicit return type. After `fetchSubreddit` has finised its sequence of actions, the `posts` variable is therefore a type-safe list of subreddit posts.

```typescript
posts = yield * fetchSubreddit(focus);
```

# Lauf v Redux-Saga-Test-Plan

Like Redux-Saga, lauf implicitly facilitates mocking and testing. Since plans explicitly `yield` actions to be executed by the runner, a test runner can just inspect the requested action, and return fixture results in response.

Unlike redux-saga-test-plan a special test middleware reducer for a 'test expression language' is unnecessary. We use the elegant strategy of an 'inverted plan' to define all tests. Where a plan is a synchronous co-routine producing actions, which consumes their **_reactions_**, an inverted plan is an asynchronous co-routine producing **_reactions_** and which consumes actions. The test harness simply passes actions and reactions between the two.

# Comparison: Lauf v Redux-Toolkit

Redux-toolkit defines solid conventions to minimise boilerplate and simplify the design of redux-based apps. An aim of lauf is to remove the boilerplate altogether by approaching the core implementation differently, relying on some of the core language capabilities of typescript.
