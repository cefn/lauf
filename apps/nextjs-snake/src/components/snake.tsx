import { useSelected } from "@lauf/store-react";
import { selectSegments, StoreProps } from "../domain";
import { SegmentSprite } from "./segment";

export function Snake({ gameStore }: StoreProps) {
  const segments = useSelected(gameStore, selectSegments);
  return (
    <>
      {segments.map((_: any, index: number) => (
        <SegmentSprite {...{ segments, index }} key={index} />
      ))}
    </>
  );
}
