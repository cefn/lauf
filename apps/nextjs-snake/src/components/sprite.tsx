import { Segment } from "../domain";
import { getNeighborDirectionNames } from "../util";
import { SpriteSheet, Sprite } from "./tile";

import sprites from "./sprites.png";

export const TILE_SIDE = 64;

const snakeSpriteOffsets = {
  HEAD_LEFT: [0, 0],
  HEAD_UP: [0, 0],
  HEAD_RIGHT: [0, 0],
  HEAD_DOWN: [0, 0],
  BODY_LEFT_UP: [0, 64],
  BODY_RIGHT_UP: [0, 64],
  BODY_DOWN_LEFT: [0, 64],
  BODY_DOWN_RIGHT: [0, 64],
  TAIL_LEFT: [0, 0],
  TAIL_UP: [0, 0],
  TAIL_RIGHT: [0, 0],
  TAIL_DOWN: [0, 0],
} as const;

export type SnakeSpriteName = keyof typeof snakeSpriteOffsets;

export const spriteSheet: SpriteSheet<SnakeSpriteName> = {
  url: sprites,
  spriteWidth: TILE_SIDE,
  spriteHeight: TILE_SIDE,
  offsets: snakeSpriteOffsets,
} as const;

type SegmentPosition = {
  segments: Segment[];
  index: number;
};

function getSpriteName({ segments, index }: SegmentPosition): SnakeSpriteName {
  const [forward, backward] = getNeighborDirectionNames(segments, index);
  let name;
  if (forward == null) {
    name = `HEAD_${forward}` as SnakeSpriteName;
  } else if (backward == null) {
    name = `TAIL_${backward}` as SnakeSpriteName;
  } else {
    name = [forward, backward].sort().join("_");
  }
  if (name in spriteSheet.offsets) {
    return name as SnakeSpriteName;
  }
  throw `Invalid sprite name ${name}`;
}

export function SegmentSprite(segmentPosition: SegmentPosition) {
  const { segments, index } = segmentPosition;
  const {
    pos: [gridX, gridY],
  } = segments[index] as Segment;
  const spriteName = getSpriteName(segmentPosition);

  return (
    <Sprite<SnakeSpriteName>
      {...{
        spriteSheet,
        spriteName,
        gridX,
        gridY,
      }}
    />
  );
}
