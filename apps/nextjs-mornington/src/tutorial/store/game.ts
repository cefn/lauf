import { createStore, Store } from "@lauf/store";

export type Player = string;
export type Station = string;

interface Move {
  station: Station;
  player: Player;
}

export interface GameState {
  players: Player[];
  turn: number;
  moves: Move[];
  winner?: Player;
}

export interface Game {
  store: Store<GameState>;
  addMove: (station: Station) => void;
}

export function createGame(): Game {
  const store = createStore<GameState>({
    players: ["Mrs Trellis", "Tim", "Barry", "Judi"],
    turn: 0,
    moves: [],
  });

  const addMove = (station: Station) =>
    store.edit((state) => {
      const { players, turn } = state;
      const player = players[turn] as Player;
      state.moves = [...state.moves, { player, station }];
    });

  return {
    store,
    addMove,
  };
}
