import { useSelected } from "@lauf/store-react";
import { Model, selectSegments } from "../state";
import { SegmentSprite } from "./segment";

export function Snake({ gameStore }: Model) {
  const segments = useSelected(gameStore, selectSegments);
  return (
    <>
      {segments.map((_: any, index: number) => (
        <SegmentSprite {...{ segments, index }} key={index} />
      ))}
    </>
  );
}
