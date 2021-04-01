import { follow, edit, receive } from "@lauf/lauf-runner-primitives";
import { backgroundPlan } from "@lauf/lauf-runner";
import { BasicStore } from "@lauf/lauf-store";
import { BasicMessageQueue } from "@lauf/lauf-queue";
import { Game, GameState, Player, Station } from "./types";
import { alert, lookupStationData, prompt } from "./action";

function createGame(): Game {
  const store = new BasicStore<GameState>({
    players: [],
    turn: 0,
    moves: [],
  });

  const queue = new BasicMessageQueue<Station>();

  return {
    store,
    queue,
  };
}

export function* launchPlan() {
  const game = createGame();
  yield* populatePlayers(game);
  yield* backgroundPlan(detectWinner, game);
  yield* backgroundPlan(advanceTurns, game);
  yield* backgroundPlan(handleInput, game);
  return game;
}

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

function* detectWinner({ store }: Game) {
  yield* follow(
    store,
    (state) => state.moves,
    function* () {
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
    }
  );
}

function* advanceTurns({ store }: Game) {
  let launching = true;

  yield* follow(
    store,
    (state) => state.moves,
    function* () {
      if (!launching) {
        //progress to next player
        const { players, turn, winner } = store.read();
        if (!winner) {
          yield* edit(store, (state) => {
            state.turn = (state.turn + 1) % players.length;
          });
        }
      } else {
        launching = false;
      }
    }
  );
}

function* handleInput({ store, queue }: Game) {
  while (true) {
    const station = yield* receive(queue);
    //retrieve matching stations
    const results = yield* lookupStationData(station);
    //check exact name match was returned
    const match = results.find((data) => data.name === station);
    if (!match) {
      const suggestions = results.length
        ? `Did you mean ${results.map((data) => data.name).join(", ")}`
        : "";
      yield* alert(
        `There is no underground station called ${station}. ${suggestions}`
      );
    } else {
      yield* edit(store, (state) => {
        const { players, turn } = state;
        const player = players[turn] as Player;
        state.moves = [...state.moves, { player, station }];
      });
    }
  }
}
