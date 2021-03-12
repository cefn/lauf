import { useSelected } from "@lauf/lauf-store-react/src";
import { selectSegments, StoreProps } from "../domain";
import { Segment } from "./segment";

export function Snake({ gameStore }: StoreProps) {
  const segments = useSelected(gameStore, selectSegments);
  return (
    <>
      {segments.map((_: any, index: number) => (
        <Segment {...{ segments, index }} key={index} />
      ))}
    </>
  );
}
