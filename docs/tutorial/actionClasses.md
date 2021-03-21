We have seen how quite rich `ActionSequences` can be created simply by using `yield*` with `follow` to monitor the state tree, or `edit` to manipulate it.

However, in some cases you may want to define your own Actions or wrap async behaviours from another library. Creating a new action is as simple as authoring a class.

The action below, which we've called `Prompt`, invokes the built-in, `window.prompt` function in the browser. This blocks then returns `string` input from the user, or `null` if they hit cancel/escape.

```typescript
export class Prompt implements Action<string | null> {
  constructor(readonly message: string) {}
  act = () => window.prompt(this.message);
}
```

We could use this class directly as part of an `ActionSequence` with a line like this...

```typescript
const response = (yield new Prompt("Think of a number")) as string | null;
```

Instead we should create a plan that yields one action and returns its result using the correct type. The `planOfAction` wrapper function does this automatically for any Action class definition...

```typescript
const prompt = planOfAction(Prompt);
```

Now we can delegate to our new plan in an `ActionSequence` with much terser, type-safe syntax like ...

```typescript
const answer = yield * prompt(message);
```

With our new `ActionPlan` let's define the sequence that captures Mornington Crescent players' names before beginning the game...

```typescript
export function* populatePlayers({ store }: Game) {
  while (true) {
    const { players } = store.read();
    const enoughPlayers = players.length >= 2;
    const message = `Type name of player ${players.length + 1}${
      enoughPlayers ? " or leave empty to play" : ""
    }`;
    const answer = yield* prompt(message);
    if (answer) {
      yield* edit(store, (state) => {
        state.players = [...state.players, answer];
      });
      continue;
    }
    if (enoughPlayers) {
      break;
    }
  }
}
```

We can do a 'blocking' delegation to the new plan in our `launchPlan()` causing it to wait until all the players have been entered...

```typescript
export function* launchPlan() {
  const game = createGame();
  yield* populatePlayers(game); //block until complete
  yield* background(detectWinner(game)); //spawn without blocking
  yield* background(advanceTurns(game)); //spawn without blocking
  return game;
}
```

In the next lesson we'll look at another crucial blocking delegation strategy - waiting on a MessageQueue.

> > Next [Message Queues](./messageQueues.md)
