import { Immutable } from "@lauf/store";
import { SegmentPosition } from "../domain";
import { SpriteSheet } from "./sprite";

export type SnakeSpriteName = keyof typeof SNAKE_SPRITE_OFFSETS;

const SNAKE_SPRITE_OFFSETS = {
  FRUIT: [0, 1],
  HEAD_LEFT: [2, 0],
  HEAD_UP: [3, 0],
  HEAD_RIGHT: [3, 1],
  HEAD_DOWN: [2, 1],
  BODY_UP_UP: [1, 0],
  BODY_DOWN_DOWN: [1, 0],
  BODY_RIGHT_RIGHT: [0, 0],
  BODY_LEFT_LEFT: [0, 0],
  BODY_LEFT_UP: [3, 2],
  BODY_DOWN_RIGHT: [3, 2],
  BODY_UP_LEFT: [2, 3],
  BODY_RIGHT_DOWN: [2, 3],
  BODY_RIGHT_UP: [2, 2],
  BODY_DOWN_LEFT: [2, 2],
  BODY_UP_RIGHT: [3, 3],
  BODY_LEFT_DOWN: [3, 3],
  TAIL_LEFT: [0, 2],
  TAIL_UP: [1, 2],
  TAIL_RIGHT: [0, 3],
  TAIL_DOWN: [1, 3],
} as const;

export const SPRITE_SIDE = 64; // in px

export const SCALE = 0.5;

export const SPRITE_SHEET: SpriteSheet<SnakeSpriteName> = {
  // Graphics thanks to https://rembound.com/articles/creating-a-snake-game-tutorial-with-html5
  url: "./sprites.png",
  width: 256,
  height: 256,
  spriteWidth: SPRITE_SIDE,
  spriteHeight: SPRITE_SIDE,
  offsets: SNAKE_SPRITE_OFFSETS,
} as const;

// TODO use some template literal types here?
export function getSegmentSpriteName({
  segments,
  index,
}: Immutable<SegmentPosition>): SnakeSpriteName {
  const fore = segments?.[index - 1]?.direction;
  const aft = segments?.[index]?.direction;
  let name: string;
  if (index === 0) {
    name = `HEAD_${aft}`;
  } else if (index === segments.length - 1) {
    name = `TAIL_${fore}`;
  } else {
    name = `BODY_${fore}_${aft}`;
  }
  if (name in SPRITE_SHEET.offsets) {
    return name as SnakeSpriteName;
  }
  throw new Error(`Invalid sprite name ${name}`);
}
