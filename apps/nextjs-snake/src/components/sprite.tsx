import { Segment } from "../domain";
import { getNeighborDirectionNames } from "../util";
import { SpriteSheet, Sprite } from "./tile";

// import sprites from "./sprites.png";

export const TILE_SIDE = 64;

const snakeSpriteOffsets = {
  HEAD_LEFT: [2, 0], //correct
  HEAD_UP: [3, 0], //correct
  HEAD_RIGHT: [3, 1], //correct
  HEAD_DOWN: [2, 1], //correct
  BODY_UP_UP: [1, 0], //correct
  BODY_DOWN_DOWN: [1, 0], //correct
  BODY_RIGHT_RIGHT: [0, 0], //correct
  BODY_LEFT_LEFT: [0, 0], //correct
  BODY_LEFT_DOWN: [3, 3], //correct
  BODY_LEFT_UP: [3, 2], //correct
  BODY_RIGHT_DOWN: [2, 3], //correct
  BODY_RIGHT_UP: [2, 2], //correct
  BODY_DOWN_LEFT: [2, 2],
  BODY_DOWN_RIGHT: [3, 2], //correct
  BODY_UP_LEFT: [2, 3], //correct
  BODY_UP_RIGHT: [3, 3],
  TAIL_LEFT: [0, 2], //correct
  TAIL_UP: [1, 2], //correct
  TAIL_RIGHT: [0, 3], //correct
  TAIL_DOWN: [1, 3], //correct
} as const;

// FRUIT : [0, 1],

export type SnakeSpriteName = keyof typeof snakeSpriteOffsets;

export const spriteSheet: SpriteSheet<SnakeSpriteName> = {
  url: "/sprites.png",
  spriteWidth: TILE_SIDE,
  spriteHeight: TILE_SIDE,
  offsets: snakeSpriteOffsets,
} as const;

type SegmentPosition = {
  segments: Segment[];
  index: number;
};

function getSpriteName({ segments, index }: SegmentPosition): SnakeSpriteName {
  let [fore, aft] = getNeighborDirectionNames(segments, index);
  let name;
  if (aft && fore) {
    name = `BODY_${fore}_${aft}`;
  } else if (aft && !fore) {
    name = `HEAD_${aft}` as SnakeSpriteName;
  } else if (fore && !aft) {
    name = `TAIL_${fore}` as SnakeSpriteName;
  } else {
    throw `Error! Snake needs at least two segments`;
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
