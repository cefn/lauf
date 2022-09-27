import { GRID_SPAN, Model } from "../state";
import { SPRITE_SIDE, SCALE } from "./graphics";
import { Fruit } from "./fruit";
import { Score } from "./score";
import { Snake } from "./snake";

export function Arena(model: Model) {
  return (
    <div
      style={{
        display: "block",
        width: GRID_SPAN * SPRITE_SIDE * SCALE,
        height: GRID_SPAN * SPRITE_SIDE * SCALE,
        backgroundColor: "yellow",
      }}
    >
      <Score {...model} />
      <Fruit {...model} />
      <Snake {...model} />
    </div>
  );
}
