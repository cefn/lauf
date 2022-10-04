import { emulateCaller } from "../event/emulate";
import { CaptureEvent } from "../event/types";

export function* playCalls<T, TReturn, TNext>(
  events: Iterable<CaptureEvent<T, TReturn, TNext>>,
  generator: Generator<T, TReturn, TNext>
) {
  for (const event of events) {
    yield emulateCaller(event, generator);
  }
}
