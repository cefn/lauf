import { Immutable } from "@lauf/store";
import {
  captureNextCall,
  captureReturnCall,
  captureThrowCall,
} from "../event/capture";
import { CaptureEvent } from "../event/types";

/** A generator that makes an Event-Sourcing record of all the
 * values passed by the caller and the generator, to sustain
 * replay that fakes either the caller or the generator.
 */
export class EventRecorder<T, TReturn, TNext>
  implements Generator<T, TReturn, TNext>
{
  generator: Generator<T, TReturn, TNext>;
  events: Immutable<Array<CaptureEvent<T, TReturn, TNext>>> = [];

  constructor(readonly createSequence: () => Generator<T, TReturn, TNext>) {
    this.generator = createSequence();
  }

  next(...args: [] | [TNext]): IteratorResult<T, TReturn> {
    const captured = captureNextCall(this.generator, ...args);
    return this.processCaptured(captured);
  }

  return(returnValue: TReturn): IteratorResult<T, TReturn> {
    const captured = captureReturnCall(this.generator, returnValue);
    return this.processCaptured(captured);
  }

  throw(thrownValue: unknown): IteratorResult<T, TReturn> {
    const captured = captureThrowCall(this.generator, thrownValue);
    return this.processCaptured(captured);
  }

  private processCaptured(captured: CaptureEvent<T, TReturn, TNext>) {
    // store event in the sequence
    this.events = [...this.events, captured as Immutable<typeof captured>];

    // re-throw if it was a throw
    if (captured.generated === "throw") {
      throw captured.thrown;
    }

    // else serve as iteration
    return captured.result;
  }

  [Symbol.iterator](): Generator<T, TReturn, TNext> {
    // Generators...customarily return this from their @@iterator method
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Iterators_and_Generators
    return this;
  }
}
