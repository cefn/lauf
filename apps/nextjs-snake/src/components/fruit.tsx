import { useSelected } from "@lauf/store-react";
import { selectFruitPos, Model } from "../state";
import { SPRITE_SHEET } from "./graphics";
import { Sprite } from "./sprite";

export function Fruit({ gameStore }: Model) {
  const fruitPos = useSelected(gameStore, selectFruitPos);
  const spriteName = "FRUIT";
  const [gridX, gridY] = fruitPos;
  return (
    <Sprite
      {...{
        spriteSheet: SPRITE_SHEET,
        spriteName,
        gridX,
        gridY
      }}
    />
  );
}
