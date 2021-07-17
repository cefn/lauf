import { useSelected } from "@lauf/store-react";
import { Model, selectScore } from "../state";

export function Score({ gameStore }: Model) {
  const score = useSelected(gameStore, selectScore);
  return <h1>Score: {score}</h1>;
}
