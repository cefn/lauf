import { Immutable } from "@lauf/lauf-store/src";
import { GRID_MAX, GRID_SPAN } from "../domain";

export type SpriteSheet<TileName extends string> = Immutable<{
  url: string;
  spriteWidth: number;
  spriteHeight: number;
  offsets: {
    [N in TileName]: [number, number];
  };
}>;

type SpriteProps<SpriteName extends string> = {
  spriteSheet: SpriteSheet<SpriteName>;
  spriteName: SpriteName;
  gridX: number;
  gridY: number;
};

export function Sprite<SpriteName extends string>({
  spriteSheet,
  spriteName,
  gridX: x,
  gridY: y,
}: SpriteProps<SpriteName>) {
  const width = spriteSheet.spriteWidth;
  const height = spriteSheet.spriteHeight;

  const backgroundImage = `url(${spriteSheet.url})`;
  const [offsetX, offsetY] = spriteSheet.offsets[spriteName];
  const backgroundPosition = `${-offsetX * width}px ${-offsetY * height}px`;

  const left = (x + GRID_MAX) * width;
  const top = (GRID_SPAN - (y + GRID_MAX)) * height; //vertical axis is inverted in browser

  const display = "block";
  const position = "absolute";

  return (
    <div
      style={{
        display,
        position,
        width,
        height,
        left,
        top,
        backgroundImage,
        backgroundPosition,
        backgroundColor: "blue",
      }}
    />
  );
}
