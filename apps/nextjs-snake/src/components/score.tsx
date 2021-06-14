import { useSelected } from "@lauf/store-react";
import { selectScore, StoreProps } from "../domain";

export function Score({ gameStore }: StoreProps) {
  const score = useSelected(gameStore, selectScore);
  return <h1>Score: {score}</h1>;
}
