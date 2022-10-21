import { CalledEvent, GeneratedEvent } from "./types";

export function emulateGenerated<T, TReturn>(
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

export function* emulateGeneratedSequence<T, TReturn>(
  events: Iterable<GeneratedEvent<T, TReturn>>
) {
  for (const event of events) {
    yield emulateGenerated(event);
  }
}

export function emulateCalled<T, TReturn, TNext>(
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

export function* emulateCalledSequence<T, TReturn, TNext>(
  events: Iterable<CalledEvent<TReturn, TNext>>,
  generator: Generator<T, TReturn, TNext>
) {
  for (const event of events) {
    yield emulateCalled(event, generator);
  }
}
