import { ChangeEvent, FormEvent, useState, useEffect } from "react";
import { useSelected } from "@lauf/store-react";
import { performSequence } from "@lauf/lauf-runner";
import {
  Game,
  selectPlayers,
  selectWinner,
  selectMoves,
  selectTurn
} from "./types";
import { launchPlan } from "./plan";

export function GameRoot() {
  const [game, setGame] = useState<Game>();

  useEffect(() => {
    async function launch() {
      const launchedGame = await performSequence(launchPlan());
      setGame(launchedGame);
    }
    launch();
  }, []);

  return (game != null) ? <SimpleGame {...game} /> : <p>Launching...</p>;
}

function PlayerSummary({ store }: Game) {
  const players = useSelected(store, selectPlayers);
  return players.length === 0 ? null : (
    <>
      <h2>Players</h2>
      <p>{players.map((player) => player).join(", ")}</p>
    </>
  );
}

function MoveSummary({ store }: Game) {
  const moves = useSelected(store, selectMoves);
  return (
    <>
      {moves.length === 0 ? null : (
        <>
          <h2>Moves</h2>
          {moves.map((move) => (
            <p>
              <strong>{move.player}</strong>: {move.station}
            </p>
          ))}
        </>
      )}
    </>
  );
}

function Form({ store, addMove }: Game) {
  const turn = useSelected(store, selectTurn);
  const { players } = store.read();

  const [text, setText] = useState("");

  const onTextChange = (event: ChangeEvent<HTMLInputElement>) =>
    setText(event.target.value);

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (text) {
      addMove(text);
      setText("");
    }
  };

  return (
    <form onSubmit={onSubmit}>
      <input
        value={text}
        onChange={onTextChange}
        placeholder={`${players[turn]} to move`}
        autoFocus
      />
    </form>
  );
}

export function SimpleGame(game: Game) {
  const winner = useSelected(game.store, selectWinner);
  return (
    <>
      {!winner ? (
        <Form {...game} />
      ) : (
        <>
          <h2>{winner} is the winner!</h2>
          <a href="">Play again</a>
        </>
      )}
      <PlayerSummary {...game} />
      <MoveSummary {...game} />
    </>
  );
}
