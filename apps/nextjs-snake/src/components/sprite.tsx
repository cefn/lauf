import React from "react";
import { Immutable } from "@lauf/store";
import { GRID_MAX, GRID_SPAN } from "../domain";

export type SpriteSheet<TileName extends string> = Immutable<{
  url: string;
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
    left: `${(gridX + GRID_MAX) * spriteWidth}px`,
    top: `${(GRID_SPAN - (gridY + GRID_MAX + 1)) * spriteHeight}px` // vertical axis is inverted in browser
  };
}

export function Sprite<SpriteName extends string>(
  spriteProps: SpriteProps<SpriteName>
) {
  const { spriteSheet, spriteName } = spriteProps;
  const { spriteWidth, spriteHeight } = spriteSheet;

  const backgroundImage = `url(${spriteSheet.url})`;
  const [offsetX, offsetY] = spriteSheet.offsets[spriteName];
  const backgroundPosition = `${-offsetX * spriteWidth}px ${
    -offsetY * spriteHeight
  }px`;

  const { left, top } = posToStyle(spriteProps);

  const display = "block";
  const position = "absolute";

  return (
    <div
      data-testclass={spriteName}
      style={{
        display,
        position,
        width: spriteWidth,
        height: spriteHeight,
        left,
        top,
        backgroundImage,
        backgroundPosition
      }}
    />
  );
}
