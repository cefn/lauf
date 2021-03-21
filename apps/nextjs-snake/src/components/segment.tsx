import { Immutable } from "@lauf/lauf-store";
import { Segment, SegmentPosition } from "../domain";
import { getSegmentSpriteName, SPRITE_SHEET } from "./graphics";
import { Sprite } from "./sprite";

export function Segment(segmentPosition: Immutable<SegmentPosition>) {
  const { segments, index } = segmentPosition;
  const {
    pos: [gridX, gridY],
  } = segments[index] as Segment;
  const spriteName = getSegmentSpriteName(segmentPosition);

  return (
    <Sprite
      {...{
        spriteSheet: SPRITE_SHEET,
        spriteName,
        gridX,
        gridY,
      }}
    />
  );
}
