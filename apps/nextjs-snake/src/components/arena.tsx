import React from "react";
import { GRID_SPAN, StoreProps } from "../domain";
import { SPRITE_SIDE } from "./graphics";
import { Fruit } from "./fruit";
import { Score } from "./score";
import { Snake } from "./snake";

export function Arena({ gameStore }: StoreProps) {
  return (
    <div
      style={{
        display: "block",
        width: GRID_SPAN * SPRITE_SIDE,
        height: GRID_SPAN * SPRITE_SIDE,
        backgroundColor: "yellow",
      }}
    >
      <Score {...{ gameStore }} />
      <Fruit {...{ gameStore }} />
      <Snake {...{ gameStore }} />
    </div>
  );
}
