import { Store } from "@lauf/lauf-store";
import { AppState, Hue, Rgb } from "./state";

export function clamp(value: number, min: number, max: number) {
  if (value < min) return min;
  if (value > max) return max;
  return value;
}

function changeColor(colorStore: Store<AppState>, rgb: Hue, amount: number) {
  colorStore.edit((draft) => {
    draft.color = draft.color.map((brightness, index) =>
      clamp(brightness + (rgb[index] || 0) * amount, 0, 255)
    ) as Rgb;
  });
}

export function increaseColor(colorStore: Store<AppState>, hue: Hue) {
  changeColor(colorStore, hue, +16);
}

export function decreaseColor(colorStore: Store<AppState>, hue: Hue) {
  changeColor(colorStore, hue, -16);
}
