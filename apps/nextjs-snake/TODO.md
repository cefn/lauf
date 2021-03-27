Remove use of storePlans etc.

Get 100% coverage of snake app src/ folder

Create simpler non-graphic version to live alongside graphic one
Explore replay... - mainPlan should run to completion, spawning any long-lived ActionSequences, returning an AppModel - Viewer should accept an AppModel in its props - outer replayable mainPlan logic will...
\_ re-play the events from the prior plan (but won't these have the wrong object references! How can edit events get late-bound to the specific store? Does replay proxy everything coming back in the AppModel? e.g. BasicStore and BasicMessageQueue objects?)
Consider how main plan can be 'replayable' i.e. what needs to be shared so the app doesn't need to know it's state has been replayed

- Probably
  (probably need to switch it out AFTER the replay otherwise it will show the re-run up to the preceding step).
  Modify main plan to always actually complete and return its state

# DEFINE SNAKE APP EVENTING PROBLEMS

- KEY REPEAT - In the naive implementation key events directly trigger snake steps

* Frequency will dictate speed and hence score. However, Key repeat depends on desktop config
* Key repeat is delayed after first keypress, creates a noticeable discontinuity
* Some platforms don't use keys at all, input event should be consistent for screen-drag and game controllers

- TIME REPEAT - Ignoring key repeat means steps are spaced deterministically. However...

* Keys being pressed should lead to an immediately visible change of direction, not after a delay
* The delay timing should be coupled to the moment the last key was pressed, not wall time
* When the timeout is hit before the key event, this should not lead to raced key events being lost

- DIRECTIONS - Want to be able to have diagonal movement by pressing two keys at once

# DEFINE RACE EVENTING PROBLEM

THe use of planOfAction ensures that ordinary actions are yielded the right way with terse commands, and with a single entity type and generator syntax throughout - you always use delegated `yield *`

However, it wraps a promise from act() with a sequence. Getting the reaction requires calling perform on the sequence.

In the case of MessageQueue, receive deliberately creates a one-off promise which if you've missed it you've missed out.

Calling `perform` on the `receive` wrapped in a `sequence` means this one-off promise can't be resumed after a timer came first, so you will miss a change.

REFACTOR STORE AND QUEUE 'PLANS'

Rewrite lauf-runner-primitives to export an object of named plans bound against a store, effectively isolating the store from direct manipulation, like...

```typescript
const {
  edit,
  select, //reading can be sync (doesn't actually need a sequence) - could help with visual debugging though
  followQueue,
  withQueue,
} = storeOps;
```

...or a queue, like...

```typescript
const { send, receive } = queueOps;
```

So e.g.

```typescript
function* fruitRoutine({ gameStore }: AppModel) {
  yield* followStoreSelector(gameStore, selectHead, function* (head) {
    const fruitPos = gameStore.select(selectFruitPos);
    if (isVectorEqual(fruitPos, head.pos)) {
      yield* eatFruit(gameStore);
    }
  });
}
```

...becomes...

```typescript
function* fruitRoutine(ops: StoreOps) {
  yield* ops.follow(selectHead, function* (head) {
    const fruitPos = yield* ops.select(selectFruitPos);
    if (isVectorEqual(fruitPos, head.pos)) {
      yield* eatFruit(ops);
    }
  });
}
```

Should add Sequences to a Finalization registry which is cleaned up by completing to an ending? Is this possible?
