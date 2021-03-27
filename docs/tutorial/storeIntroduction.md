Let's create a simple Store for our game of Mornington Crescent.

In this game, Players take turns to call out the name of a stop on the London Underground. The first player to call out 'Mornington Crescent' is the winner.

Let's define the structure of our game state using Typescript types.

```typescript
export type Player = string;
export type Location = string;

interface Move {
  location: Location;
  player: Player;
}

export interface GameState {
  players: Player[];
  turn: Player;
  moves: Move[];
  winner?: Player;
}
```

We can create a Store for our new game using lauf's BasicStore:

```typescript
const store = new BasicStore<GameState>({
  players: ["Mrs Trellis", "Tim", "Barry", "Judi"],
  turn: "Mrs Trellis",
  moves: [],
});
```

A lauf Store is very simple:

- It accepts a 'root' javascript item (object or array) as a state 'tree'
- Objects and arrays in the state tree are never modified
- Edits are performed instead by _replacing_ objects or arrays.
- Descendants unchanged by an edit are _never_ replaced

The Store `edit` method is implemented using [immer](https://immerjs.github.io/immer/), which makes the fewest possible changes in the state tree to fulfil the edit you define.

To move, the player taking their turn calls out an underground station like...

```typescript
addMove("Putney Bridge");
```

We use `edit` to implement the `addMove` function as an operation on the Store.

```typescript
const addMove = (station: Station) =>
  store.edit((state) => {
    const player = state.turn;
    state.moves = [...state.moves, { player, station }];
  });
```

Adding a move replaces the `moves` array with a copy containing the extra move. The [immer](https://immerjs.github.io/immer/) library will ensure the root object is replaced with a copy pointing to the new `moves` array. Other objects in the tree remain untouched.

Whenever the root is replaced, a notification is sent to Watchers. They can track updates and selectively refresh derived data or rendered views. For our UI components to be notified efficiently of updates, we need to make our React components watch the Store.

To pass this information easily, below we consolidate all the application initialisation steps into a single operation that returns a `Game` object.

```typescript
export type Game = {
  store: Store<GameState>;
  addMove: (location: Location) => void;
};

export function createGame(): Game {
  const store = new BasicStore<GameState>({
    players: ["Mrs Trellis", "Tim", "Barry", "Judi"],
    turn: "Mrs Trellis",
    moves: [],
  });

  const addMove = (station: Station) =>
    store.edit((state) => {
      const player = state.turn;
      state.moves = [...state.moves, { station, player }];
    });

  return {
    store,
    addMove,
  };
}
```

In the next lesson, React components will be given the `Game` as their props to access `store` and `addMove`.

Next >> [Binding React to your Store](./bindingReact.md)
