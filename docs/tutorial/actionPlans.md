## Isolating Business Logic

UI code gathers user input and **_renders_** state. However there are clear advantages from implementing and testing **_operations_** on state in complete isolation from the UI.

Implementing 'pure' business logic avoids operations on state taking place within a render. UI lifecycle stages which should **_detect_** state changes won't also sometimes **_trigger_** state changes leading to loops.

With fully isolated business logic, multiple UI frameworks can be supported in the same codebase, and binding to a new framework is just a matter of dispatching state information from the logic to the UI, and user input events from the UI to the logic.

Finally business logic without UI dependencies is easier to test, as it can be mocked outside a browser context for unit and component tests.

## ActionSequences for Mornington Crescent

The [lauf-runner](../../modules/lauf-runner) library helps us write business logic in isolation from our UI, to control the propagation of state changes and events without any React or Redux. It does this using `ActionSequences`

Let's see a complete example and then break it down. The first `ActionSequence` for our game responds to new moves and declares if there's a winner.

<!-- prettier-ignore-start -->
```typescript
function* detectWinner({ store }: Game) {
    yield* follow( store, (state) => state.moves, function* () {
        const { moves, winner } = store.read();
        if (!winner) {
            //inspect the last move
            const lastMove = moves[moves.length - 1];
            if (lastMove && lastMove.station === "Mornington Crescent") {
                //declare the winner
                yield* edit(store, (state) => {
                    state.winner = lastMove.player;
                });
            }
        }
    });
}
```
<!-- prettier-ignore-end -->

Don't worry if this looks unfamiliar. By the end of this lesson, the code above should be understandable.

## Actions

A central concept in lauf-runner is the `Action`. An action defines what should happen, and what you should get back when it ends. Here is Lauf's type definition for `Action`.

```typescript
export interface Action<Reaction> {
  act: () => Reaction | Promise<Reaction>;
}
```

So behind the scenes in Javascript, an action looks something like this, which would give back some user input from a prompt...

<!-- prettier-ignore-start -->
```typescript
{ act: () => window.prompt("What is your name?"); }
```
<!-- prettier-ignore-end -->

## ActionSequences

For an `Action` to be carried out, and to get back the result, you `yield` it from an `ActionSequence`.

Lauf will run each `Action` you yield from an `ActionSequence` and get the value of its `Reaction`. It halts the sequence until the value is available. The `yield` expression is set to the resulting value and it resumes.

Crucially...

1. `ActionSequences` are paused when waiting for change. This bypasses the need for any progress-tracking state. They automatically track where they were up to.
2. `ActionSequences` raise atomic `Actions` that can be intercepted. In this way, Actions can be logged, tracked, and mocked and their sequences even reversed for time-travel debugging, all without changing a line of code.

## ActionPlans

`ActionPlans` are the function definitions used to create an `ActionSequence`. Let's look at a minimal ActionPlan.

The code below is broken into three stages for illustration. It shows an `ActionPlan` being defined, an `ActionSequence` being created from it, and `lauf-runner` being asked to run the sequence...

```typescript
import { performSequence } from "@lauf/lauf-runner";

function* plan(): ActionSequence {
  const name = yield { act: () => prompt("What is your full name? ") };
  yield { act: () => alert(`Pleased to meet you, ${name as string}!`) };
  return name;
}
const sequence = plan();
const name = await performSequence(sequence);
```

## Generator Functions

You have probably noticed, an `ActionPlan` is just a [Typescript generator **_function_**](https://basarat.gitbook.io/typescript/future-javascript/generators) and an `ActionSequence` is just the **_generator_** returned by calling an `ActionPlan`.

Idiomatically, the illustrated sequence above would be written as shown below. We will learn more about the `yield*` syntax below, and see how to make your actions available with the preferred syntax in the next lesson.

```typescript
import { performPlan } from "@lauf/lauf-runner";

const name = await performPlan(function* () {
  const name = yield* prompt("What is your name?");
  yield* alert(`Pleased to meet you, ${name}!`);
  return name;
});
```

Compared to Redux or React Hooks for managing and changing state, the sequential and branching logic of idiomatic plans is easily readable and testable.

As Lauf `ActionSequences` are synchronous typescript generator functions, they can include any loops, logic, transformations and error handling which you would use in a regular synchronous function.

Now let's understand what `yield*` is actually doing, before we use it with our own actions.

## Delegation

While it is running, an ActionSequence can create another ActionSequence and delegate to it. This is done using the `yield*` syntax. Other than the special syntax, the delegation is just like calling a function inside another function.

The modules [lauf-runner](../../modules/lauf-runner) and [lauf-runner-primitives](../../modules/lauf-runner-primitives) include built-in `ActionPlans`. These can be called to create `ActionSequences` you can delegate to. The sequences define interactions with Stores, Queues and external interfaces, such as...

- `select` - get `Store` state
- `edit` - change `Store` state
- `follow` - monitor `Store` state (**_blocking_**)
- `send` - put item in a `MessageQueue`
- `receive` - take item from a `MessageQueue` (**_blocking_**)
- `wait` - pause until a single `Promise` completes (**_blocking_**)
- `raceWait` - pause until one `Promise` completes from a list (**_blocking_**)
- `backgroundPlan` - spawn an `ActionPlan` without blocking, (**_returns Promise of plan's return value_**)
- `backgroundAllPlans` - spawn a list of `ActionPlans` without blocking, (**_returns Promise of all return values_**)

# Revisiting detectWinner()

Now let's work through how the `ActionSequence` of `detectWinner()` detects changes and carries out edits in the `Store`...

<!-- prettier-ignore-start -->
```typescript
function* detectWinner({ store }: Game) {
    yield* follow( store, (state) => state.moves, function* () {
        const { moves, winner } = store.read();
        if (!winner) {
            //inspect the last move
            const lastMove = moves[moves.length - 1];
            if (lastMove && lastMove.station === "Mornington Crescent") {
                //declare the winner
                yield* edit(store, (state) => {
                    state.winner = lastMove.player;
                });
            }
        }
    });
}
```
<!-- prettier-ignore-end -->

Our `detectWinner` sequence delegates immediately to a `follow` sequence. This delegation passes the store and selector to follow, and an `ActionPlan` as a `Follower`. This plan will be triggered once for the original value of `moves`, then re-triggered every time the `moves` value changes.

Within our `Follower` we access the latest value of `moves` and `winner` checking to see if the winning state needs modifying. If the last move was a winning move, we `edit` the Store, declaring the player with the current `turn` to be the `winner`.

## Advancing the turn to the next Player

In the case there wasn't a winner, we still need to change which player has the next turn. The `advanceTurns` plan can run concurrently with `detectWinner`

<!-- prettier-ignore-start -->
```typescript
function* advanceTurns({ store }: Game) {
  let launching = true;

  yield* follow(store, (state) => state.moves, function* () {
    if (launching) {
      launching = false;
    }
    else{
      //progress to next player
      const { players, turn, winner } = store.read();
      if (!winner) {
        const lastPlayerPos = players.indexOf(turn);
        const nextPlayerPos = (lastPlayerPos + 1) % players.length;
        const nextPlayer = players[nextPlayerPos] as Player;
        yield* edit(store, (state) => {
            state.turn = nextPlayer;
        });
      }
    }
  });
}
```
<!-- prettier-ignore-end -->

Our `advanceTurns()` function is triggered a lot like `detectWinner()`. However, we ignore the initial `moves` array. Only when the `moves` array gets **_longer_** we treat the change as a move and advance the player.

## Running Sequences Concurrently

Both sequences need to be running to apply their constraints to the game.

To run these plans concurrently we create a `launchPlan()`. This creates the `Game` and launches both plans as background sequences before returning the active `Game` object so that e.g. React components can be bound against it.

```typescript
export function* launchPlan() {
  const game = createGame();
  yield* backgroundPlan(detectWinner, game);
  yield* backgroundPlan(advanceTurns, game);
  return game;
}
```

The React implementation remains exactly as before. All the new state and logic has been implemented in isolation from the React components themselves.

> > Next [Writing Actions](./actionClasses.md)
