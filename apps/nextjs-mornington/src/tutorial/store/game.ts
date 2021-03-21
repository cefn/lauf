import { BasicStore, Store } from "@lauf/lauf-store";

export type Player = string;
export type Station = string;

interface Move {
  station: Station;
  player: Player;
}

export interface GameState {
  players: Player[];
  turn: Player;
  moves: Move[];
  winner?: Player;
}

export type Game = {
  store: Store<GameState>;
  addMove: (station: Station) => void;
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
