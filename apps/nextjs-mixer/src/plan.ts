import { BasicMessageQueue } from "@lauf/lauf-queue/src";
import { background } from "@lauf/lauf-runner";
import { edit, receive } from "@lauf/lauf-runner-primitives";
import { BasicStore } from "@lauf/lauf-store/src";

import {
  AppModel,
  AppState,
  ColorChange,
  ColorName,
  INITIAL_STATE,
  Rgb,
  RGB_LOOKUP,
} from "./domain";

export function createAppModel(): AppModel {
  const colorStore = new BasicStore<AppState>(INITIAL_STATE);
  const changeQueue = new BasicMessageQueue<ColorChange>();
  const increaseColor = (colorName: ColorName) =>
    changeQueue.send([colorName, +16]);
  const decreaseColor = (colorName: ColorName) =>
    changeQueue.send([colorName, -16]);
  return {
    colorStore,
    changeQueue,
    increaseColor,
    decreaseColor,
  };
}

export function* mainPlan() {
  const appModel = createAppModel();
  yield* background(colorChangePlan(appModel));
  return appModel;
}

export function* colorChangePlan(appModel: AppModel) {
  const { changeQueue } = appModel;
  while (true) {
    const [color, amount] = yield* receive(changeQueue);
    const rgb = RGB_LOOKUP[color] as Rgb;
    yield* addColor(appModel, rgb, amount);
  }
}

export function* addColor({ colorStore }: AppModel, rgb: Rgb, amount: number) {
  yield* edit(colorStore, (state) => {
    state.color = state.color.map((brightness, index) =>
      clamp(brightness + (rgb[index] || 0) * amount, 0, 255)
    ) as Rgb;
  });
}

export function clamp(value: number, min: number, max: number) {
  if (value < min) return min;
  if (value > max) return max;
  return value;
}
