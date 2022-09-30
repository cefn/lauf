import { ChangeEvent, FormEvent, useState } from "react";
import { createGame, Game } from "./game";
import { useSelected } from "@lauf/store-react";

function Summary({ store }: Game) {
  const moves = useSelected(store, (state) => state.moves);
  return moves.length === 0 ? null : (
    <>
      <h2>Moves</h2>
      {moves.map((move) => (
        <p>
          <strong>{move.player}</strong>: {move.station}
        </p>
      ))}
    </>
  );
}

function Form({ store, addMove }: Game) {
  const turn = useSelected(store, (state) => state.turn);
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

export function SimpleGame() {
  const [game] = useState<Game>(() => createGame());

  return (
    <>
      <Form {...game} />
      <Summary {...game} />
    </>
  );
}
