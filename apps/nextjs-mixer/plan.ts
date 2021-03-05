import { BasicMessageQueue } from "@lauf/lauf-queue";
import { performPlan } from "@lauf/lauf-runner";
import { BasicStore } from "@lauf/lauf-store";
import { editValue, receive } from "@lauf/lauf-store-runner";

import { AppState, Rgb, ColorName, ColorChange, colorVectors } from "./domain";
import { clamp } from "./util";

export const colorStore = new BasicStore<AppState>({
  color: [0, 0, 0],
});

const changeQueue = new BasicMessageQueue<ColorChange>();

function changeColor(...args: ColorChange) {
  changeQueue.send(args);
}

export function increaseColor(colorName: ColorName) {
  changeColor(colorName, +16);
}

export function decreaseColor(colorName: ColorName) {
  changeColor(colorName, -16);
}

performPlan(function* colorChangePlan() {
  while (true) {
    const [name, magnitude] = yield* receive(changeQueue);
    const colorVector = colorVectors[name] as Rgb;
    yield* editValue(colorStore, (state) => {
      state.color = state.color.map<number>((brightness, index) =>
        clamp(brightness + (colorVector[index] || 0) * magnitude, 0, 255)
      );
    });
  }
});
