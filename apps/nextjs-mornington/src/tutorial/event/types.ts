import { MessageQueue } from "@lauf/queue";
import { Immutable, Store } from "@lauf/store";

export type Player = string;
export type Station = string;

export interface Move {
  station: Station;
  player: Player;
}

export interface GameState {
  players: Player[];
  turn: number;
  moves: Move[];
  winner?: Player;
}

export type Game = {
  store: Store<GameState>;
  queue: MessageQueue<Station>;
};

export const selectPlayers = (state: Immutable<GameState>) => state.players;
export const selectWinner = (state: Immutable<GameState>) => state.winner;
export const selectTurn = (state: Immutable<GameState>) => state.turn;
export const selectMoves = (state: Immutable<GameState>) => state.moves;
