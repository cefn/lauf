import { Immutable } from "@lauf/lauf-store/src";
import { GRID_MAX } from "../domain";

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
  spriteName: name,
  gridX: x,
  gridY: y,
}: SpriteProps<SpriteName>) {
  const backgroundImage = `url(${spriteSheet.url})`;
  const [offsetX, offsetY] = spriteSheet.offsets[name];
  const backgroundPosition = `${offsetX}px ${offsetY}px`;

  const left = (x + GRID_MAX) * spriteSheet.spriteWidth;
  const top = (y + GRID_MAX) * spriteSheet.spriteHeight;

  return (
    <div
      style={{
        left,
        top,
        backgroundImage,
        backgroundPosition,
      }}
    />
  );
}
