import { useSelected } from "@lauf/lauf-store-react/src";
import { selectScore, StoreProps } from "../domain";

export function Score({ gameStore }: StoreProps) {
  const score = useSelected(gameStore, selectScore);
  return <h1>Score: {score}</h1>;
}
