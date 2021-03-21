import { useSelected } from "@lauf/lauf-store-react";
import { StoreProps, selectFruitPos } from "../domain";
import { SPRITE_SHEET } from "./graphics";
import { Sprite } from "./sprite";

export function Fruit({ gameStore }: StoreProps) {
  const fruitPos = useSelected(gameStore, selectFruitPos);
  const spriteName = "FRUIT";
  const [gridX, gridY] = fruitPos;
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
