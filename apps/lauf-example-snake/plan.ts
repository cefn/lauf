import { BasicMessageQueue } from "@lauf/lauf-queue";
import { performPlan } from "@lauf/lauf-runner";
import { BasicStore, Selector } from "@lauf/lauf-store";
import { editValue, receive } from "@lauf/lauf-store-runner";
import { Immutable } from "@lauf/lauf-store/types/immutable";

export type Rgb = [number, number, number];

interface AppState {
  color: Rgb;
}

const vectorLookup: Record<string, Readonly<Rgb>> = {
  R: [1, 0, 0],
  E: [-1, 0, 0],
  G: [0, 1, 0],
  F: [0, -1, 0],
  B: [0, 0, 1],
  V: [0, 0, -1],
} as const;

export const colorStore = new BasicStore<AppState>({
  color: [0, 0, 0],
});

export const selectColor = (state: Immutable<AppState>) => state.color;

export const keyCodeQueue = new BasicMessageQueue<string>();

const clamp = (value: number, min: number, max: number) => {
  if (value < min) return min;
  if (value > max) return max;
  return value;
};

performPlan(function* () {
  while (true) {
    const keyCode = yield* receive(keyCodeQueue);
    const vector = vectorLookup?.[keyCode];
    if (vector) {
      yield* editValue(colorStore, (state) => {
        state.color = state.color.map<number>((brightness, index) =>
          clamp(brightness + (vector[index] || 0), 0, 255)
        );
      });
    }
  }
});
