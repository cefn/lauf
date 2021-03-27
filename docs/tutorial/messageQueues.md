In our first draft of the move-handling code for Mornington Crescent our React components received a callback that added moves directly to the Store. This change in game state triggered other renderers and logic to consume the extra move.

Writing to a `Store` is a good 'broadcast' strategy if the data is...

- always valid
- long-lived state
- consumed by multiple handlers

Writing to a `MessageQueue` is a better approach for data which is...

- possibly invalid
- a transient event
- consumed by one handler

Instead of sharing a callback with our React components we will pass them a `MessageQueue` so they can send moves for the Mornington Crescent game. Here is a `Form` `onSubmit` handler implemented with a `MessageQueue`...

```typescript
const onSubmit = (event: FormEvent) => {
  event.preventDefault();
  if (text) {
    queue.send(text);
    setText("");
  }
};
```

A single `ActionPlan` can receive everything sent to the `MessageQueue`. Here is a basic implementation that waits for events from the queue, and always adds the move to the game.

```typescript
function* handleInput({ store, queue }: Game) {
  while (true) {
    const station = yield* receive(queue);
    yield* edit(store, (state) => {
      const { players, turn } = state;
      const player = players[turn] as Player;
      state.moves = [...state.moves, { player, station }];
    });
  }
}
```

Now we're ready to add some multi-stage asynchronous logic to `handleInput(...)`. This can decide if a move is valid **_before_** modifying the Store.

Next >> [Async Actions](./asyncActions.md)
