import { BasicMessageQueue } from "@lauf/lauf-queue";
import { performSequence } from "@lauf/lauf-runner";
import { BasicStore } from "@lauf/lauf-store";
import { editValue, receive } from "@lauf/lauf-store-runner";

import {
  AppState,
  Rgb,
  ColorName,
  ColorChange,
  AppModel,
  RGB_LOOKUP,
} from "./domain";
import { clamp } from "./util";

export function launchMixer() {
  const colorStore = new BasicStore<AppState>({
    color: [0, 0, 0],
  });
  const changeQueue = new BasicMessageQueue<ColorChange>();

  performSequence(colorChangePlan({ colorStore, changeQueue }));

  return {
    colorStore,
    increaseColor: (colorName: ColorName) => changeQueue.send([colorName, +16]),
    decreaseColor: (colorName: ColorName) => changeQueue.send([colorName, -16]),
  };
}

function* colorChangePlan(appModel: AppModel) {
  const { changeQueue } = appModel;
  while (true) {
    const [color, amount] = yield* receive(changeQueue);
    const rgb = RGB_LOOKUP[color] as Rgb;
    yield* addColor(appModel, rgb, amount);
  }
}

function* addColor({ colorStore }: AppModel, rgb: Rgb, amount: number) {
  yield* editValue(colorStore, (state) => {
    state.color = state.color.map((brightness, index) =>
      clamp(brightness + (rgb[index] || 0) * amount, 0, 255)
    ) as Rgb;
  });
}
