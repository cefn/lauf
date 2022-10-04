import { CalledEvent, GeneratedEvent } from "./types";

export function emulateGenerator<T, TReturn>(
  event: GeneratedEvent<T, TReturn>
) {
  const { generated } = event;
  // emulate the original generator behaviour
  if (generated === "yield" || generated === "return") {
    return event.result;
  } else {
    throw event.thrown;
  }
}

export function* emulateGeneratorSequence<T, TReturn>(
  events: Iterable<GeneratedEvent<T, TReturn>>
) {
  for (const event of events) {
    yield emulateGenerator(event);
  }
}

export function emulateCaller<T, TReturn, TNext>(
  event: CalledEvent<TReturn, TNext>,
  generator: Generator<T, TReturn, TNext>
) {
  switch (event.called) {
    case "next":
      const { nextValue } = event;
      return nextValue ? generator.next(nextValue) : generator.next();
    case "return":
      return generator.return(event.returnValue);
    case "throw":
      return generator.throw(event.thrownValue);
  }
}

export function* emulateCallerSequence<T, TReturn, TNext>(
  events: Iterable<CalledEvent<TReturn, TNext>>,
  generator: Generator<T, TReturn, TNext>
) {
  for (const event of events) {
    yield emulateCaller(event, generator);
  }
}
