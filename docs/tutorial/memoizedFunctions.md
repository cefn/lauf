There is a fundamental problem when using a `Selector` to define data **_derived_** from the `Store`, as opposed to data **_retrieved_** from the `Store`. In this lesson, we explain the problem and show how **_memoizing_** selectors provides a solution.

Consider the following `Selector` which puts the names of Tic-Tac-Toe players in a list...

```typescript
const state = { noughts: { name: "john" }, crosses: { name: "jane" } };
const selector = ({ noughts, crosses }) => [noughts.name, crosses.name];
const a = selector(state); // ["john","jane"]
const b = selector(state); // ["john","jane"]
const isEqual = Object.is(a, b); // false
```

Note this `Selector` **_always_** creates a new list. Although `a` and `b` have the same entries, they are not the same list.

A selector implemented like this would trigger re-renders even when they were not necessary.

We use `Selectors` to define parts of the `Store` for `ActionPlans` and `React` components to consume. Changes happening elsewhere in the state tree should be ignored. For example, the `follow` function triggers logic, and the `useSelected` function triggers a re-render, when some part of the state changes.

Both of these functions accept `Selectors` to ensure logic or rendering is only triggered when data has actually changed. Under the hood in `follow` and `useSelected`, after every change to the `Store`, we use your `Selector` to retrieve the `selected` value again. If `Object.is(selected, prevSelected)` the current selected data has already been processed. No re-render or re-compute should be triggered.

Lauf `Store` edits are completed by [immer](https://github.com/immerjs/immer). Immer replaces items in the tree **_only_** when they or their descendants have changed, and leaves other parts of the tree intact. This ensures that when our `Selector` **_retrieves_** unchanged data from the tree, it will be the same exact item that it was before.

However, a specific solution is needed when a `Selector` **_computes_** derived data from parts of the store. The solution is [explained in the Redux docs](https://redux.js.org/recipes/computing-derived-data). Like Redux we use the standalone [reselect](https://github.com/reduxjs/reselect) library to memoize selectors which compute derived data from state.

A function wrapped by reselect's `defaultMemoize` function caches its most recent arguments and return value. Call it again with the same exact arguments and it will return the same exact value. However, given Store [immutability](https://redux.js.org/faq/immutable-data#what-are-the-benefits-of-immutability) the root state object in our `Store` is always a different object whenever any of its descendents have changed. Memoizing a function that takes an Immutable state object (like the Tic-Tac-Toe name selector) would do no good. The root of the state tree is different after every change, so the memoized cache would never be used.

To create a new list only when the **_names_** have changed, we use reselect's `createSelector`. This will first **_select_** items from the store, then pass the results to a factory function to **_derive_** the data. Reselect memoizes the derive function. If its inputs are the same, the derived data will be the same.

In the example below `createSelector` is provided with two selectors pull out the names. These results are then passed as two arguments to the derive function. When the names are unchanged the memoized derive function gets identical arguments, and therefore returns the same list from its cache.

```typescript
import { createSelector } from "reselect";
let state = { noughts: { name: "john" }, crosses: { name: "jane" } };
const selector = createSelector(
  [({ noughts }) => noughts.name, ({ crosses }) => crosses.name],
  (noughtsName, crossesName) => [noughtsName, crossesName]
);
const a = selector(state); // ["john","jane"]
state = {
  ...state,
  winner: "John",
}; //edit has replaced state object
const b = selector(state); // ["john","jane"] from memoized cache
const isEqual = Object.is(a, b); // true
```

We have successfully memoized our Tic-Tac-Toe name selector. It will only produce a new list when the underlying names are different.
