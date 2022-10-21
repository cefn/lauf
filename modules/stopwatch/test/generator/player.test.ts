import { describe, test, expect } from "vitest";

import { EventPlayer } from "../../src/replay/generatorPlayer";
import { EventRecorder } from "../../src/replay/generatorRecorder";

describe("EventPlayingGenerator emulates generators accurately", () => {
  test.each([
    [
      "explicit number sequence",
      function* () {
        yield 3;
        yield 4;
        yield 5;
      },
    ],
    [
      "delegated number sequence",
      function* () {
        yield* [3, 4, 5];
      },
    ],
  ])(
    "Can emulate sequence emitted by generatorFn '%s'",
    (_caseName, sourceGeneratorFn) => {
      // generate values
      const sourceValues = [...sourceGeneratorFn()];

      // generate values while recording events
      const recordingGenerator = new EventRecorder(sourceGeneratorFn);
      const recordedValues = [...recordingGenerator];

      // playback values from the recorded events
      const playingGenerator = new EventPlayer(recordingGenerator.events);
      const playedValues = [...playingGenerator];

      // record the events from a playback
      const playbackRecordingGenerator = new EventRecorder(
        () => new EventPlayer(recordingGenerator.events)
      );
      const recordedPlayedValues = [...playbackRecordingGenerator];

      // These should be identical:
      // recording of the source should be transparent
      expect(recordedValues).toStrictEqual(sourceValues);
      // playingGenerator should replay the same values
      expect(playedValues).toStrictEqual(sourceValues);
      // recording of the playback should be transparent
      expect(recordedPlayedValues).toStrictEqual(sourceValues);

      // The sequence of events recorded when iterating the source
      // should be identical to those recorded when iterating the playback
      expect(recordingGenerator.events).toStrictEqual(
        playbackRecordingGenerator.events
      );
    }
  );

  // test("", () => {
  //   const echoString = function* (): Generator<string, string, string> {
  //     let doubled = "";
  //     for (;;) {
  //       try {
  //         doubled = yield doubled + doubled;
  //       } catch (error) {
  //         // do nothing
  //       }
  //     }
  //   };

  //   // record some calls made against echoString
  //   const firstRecordingGenerator = new EventRecordingGenerator(echoString);
  //   let value: string | undefined;
  //   let done: boolean | undefined = false;
  //   for (let i = 0; i < 3 && !done; i++) {
  //     ({ done, value } = firstRecordingGenerator.next(
  //       ...(value ? [value] : [])
  //     ));
  //   }
  //   firstRecordingGenerator.throw(new Error("Oops"));
  //   firstRecordingGenerator.return("ending");

  //   // replay the calls
  //   const playbackCaller = new EventPlayingCaller(
  //     firstRecordingGenerator.events
  //   );
  //   // calls are made against a duplicate of the original generator
  //   const secondRecordingGenerator = new EventRecordingGenerator(echoString);
  //   // trigger the calls
  //   playbackCaller.playCalls(secondRecordingGenerator);

  //   // check sequence arising from the calls
  //   // was identical to the event sequence of the original
  //   expect(firstRecordingGenerator.events).toStrictEqual(
  //     secondRecordingGenerator.events
  //   );
  // });

  // test.each([
  //   ["echo generator"],
  //   [
  //     "summing generator",
  //     function* (): Generator<number, void, number> {
  //       let accumulator = 0;
  //       for (;;) {
  //         accumulator = yield accumulator;
  //       }
  //     },
  //   ],
  // ])(
  //   "Can emulate calls made by caller '%s'",
  //   (_caseName, sourceGeneratorFn) => {
  //     const recordingGenerator = new EventRecordingGenerator<
  //       number | string,
  //       void,
  //       number | string
  //     >(sourceGeneratorFn);
  //   }
  // );
});
