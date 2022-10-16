import { Immutable } from "@lauf/store";
import { emulateGenerated } from "../event/emulate";
import { CalledEvent, GeneratedReturn, CaptureEvent } from "../event/types";
import {
  validatedNextCall,
  validatedReturnCall,
  validatedThrowCall,
} from "../event/validate";

/** A Generator that can be instructed to emulate the stack behaviour of another
 * Generator. Driven by a list of SequenceEvents e.g. recorded by iterating over
 * an EventRecordingGenerator
 */
export class EventPlayer<T, TReturn, TNext>
  implements Generator<T, TReturn, TNext>
{
  /** Each playback iterates the stored events just once. */
  private eventIterator: Iterator<Immutable<CaptureEvent<T, TReturn, TNext>>>;

  /** Stored since Generator API needs {done:true} event to be repeated. */
  private doneEvent:
    | (CalledEvent<TReturn, TNext> & GeneratedReturn<TReturn>)
    | null = null;

  constructor(
    recordedEvents: Immutable<CaptureEvent<T, TReturn, TNext>[]>,
    private readonly validateCalls = true
  ) {
    this.eventIterator = recordedEvents[Symbol.iterator]();
  }

  private getNextEvent() {
    const { eventIterator, doneEvent } = this;

    let event: CaptureEvent<T, TReturn, TNext>;
    if (doneEvent) {
      event = doneEvent;
    } else {
      const eventResult = eventIterator.next();
      event = eventResult.value;
      if (event.generated === "return") {
        this.doneEvent = event;
      }
    }
    return event;
  }

  next(...args: [TNext] | []) {
    const event = this.getNextEvent();
    if (!this.validateCalls) {
      return emulateGenerated(event);
    } else {
      return emulateGenerated(validatedNextCall(event, ...args));
    }
  }

  return(returnValue: TReturn) {
    const event = this.getNextEvent();
    if (!this.validateCalls) {
      return emulateGenerated(event);
    } else {
      return emulateGenerated(validatedReturnCall(event, returnValue));
    }
  }

  throw(thrownValue: unknown) {
    const event = this.getNextEvent();
    if (!this.validateCalls) {
      return emulateGenerated(event);
    } else {
      return emulateGenerated(validatedThrowCall(event, thrownValue));
    }
  }

  [Symbol.iterator](): Generator<T, TReturn, TNext> {
    // Generators...customarily return this from their @@iterator method
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Iterators_and_Generators
    return this;
  }
}
