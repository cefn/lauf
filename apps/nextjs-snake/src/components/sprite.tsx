import React from "react";
import { Immutable } from "@lauf/store";
import { GRID_MAX, GRID_SPAN } from "../state";
import { SCALE } from "./graphics";

export type SpriteSheet<TileName extends string> = Immutable<{
  url: string;
  width: number;
  height: number;
  spriteWidth: number;
  spriteHeight: number;
  offsets: {
    [N in TileName]: [number, number];
  };
}>;

interface SpriteProps<SpriteName extends string> {
  spriteSheet: SpriteSheet<SpriteName>;
  spriteName: SpriteName;
  gridX: number;
  gridY: number;
}

export function posToStyle<SpriteName extends string>(
  spriteProps: SpriteProps<SpriteName>
) {
  const {
    gridX,
    gridY,
    spriteSheet: { spriteWidth, spriteHeight }
  } = spriteProps;
  return {
    left: `${(gridX + GRID_MAX) * spriteWidth * SCALE}px`,
    top: `${(GRID_SPAN - (gridY + GRID_MAX + 1)) * spriteHeight * SCALE}px` // vertical axis is inverted in browser
  };
}

export function Sprite<SpriteName extends string>(
  spriteProps: SpriteProps<SpriteName>
) {
  const { spriteSheet, spriteName } = spriteProps;
  const { width, height, spriteWidth, spriteHeight } = spriteSheet;

  const backgroundImage = `url(${spriteSheet.url})`;
  const [offsetX, offsetY] = spriteSheet.offsets[spriteName];
  const backgroundPosition = `${-offsetX * spriteWidth * SCALE}px ${
    -offsetY * spriteHeight * SCALE
  }px`;
  const backgroundSize = `${width * SCALE}px ${height * SCALE}px`;

  const { left, top } = posToStyle(spriteProps);

  const display = "block";
  const position = "absolute";

  return (
    <div
      data-testclass={spriteName}
      style={{
        display,
        position,
        width: spriteWidth * SCALE,
        height: spriteHeight * SCALE,
        left,
        top,
        backgroundImage,
        backgroundPosition,
        backgroundSize
      }}
    />
  );
}
