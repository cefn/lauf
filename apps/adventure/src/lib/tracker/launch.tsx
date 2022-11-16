/** Lauf state and stepping */
import { Immutable, Store } from "@lauf/store";
import { Command, createPerformance } from "@lauf/stepmachine";

/** Support Stories */
import { StoryState } from "../../stories/about";
import { Narrative, NarrativeOp } from "../narrative";

/** Tracker support */
import { IncompleteMoment } from "./history";
import { TrackerState } from "./store";

/** Launches a story, using a runner that allows inspection of the commanded
 * operations, the returned values and the transient state */
export async function launchTracker(
  trackerStore: Store<TrackerState>,
  storyStore: Store<StoryState>,
  storyPlan: () => Narrative<void>
) {
  // performance is a generator that alternates between yielding a command and
  // yielding the result of that command
  const performance = createPerformance(storyPlan);

  for (;;) {
    // grab current history to combine into later edits
    const commandHistory = trackerStore.read()["history"];

    // command yield phase
    {
      const onResumed = storyStore.read();
      const commandResult = await performance.next();
      const onCommanded = storyStore.read();
      if (commandResult.done) {
        return commandResult.value;
      }
      const commanded = commandResult.value as Command<NarrativeOp>;
      const incompleteMoment: Immutable<
        IncompleteMoment<NarrativeOp, StoryState>
      > = {
        commanded,
        snapshots: {
          onResumed,
          onCommanded,
        },
      } as const;
      // record the part-complete moment to history
      trackerStore.write({
        ...trackerStore.read(),
        history: [...commandHistory, incompleteMoment],
      });
    }

    {
      // returnValue yield phase
      const returnedResult = await performance.next();
      if (returnedResult.done) {
        return returnedResult.value;
      }
      const returned = returnedResult.value as Awaited<ReturnType<NarrativeOp>>;
      // Immutable-safe edit of command moment from previous step
      // record the moment to history

      const state = trackerStore.read();

      const incompleteMoment = [...state.history].pop();

      if (!incompleteMoment) throw new Error("History integrity problem");

      const completeMoment = {
        ...incompleteMoment,
        returned,
        snapshots: {
          ...incompleteMoment.snapshots,
          onResolved: storyStore.read(),
        },
      };

      trackerStore.write({
        ...state,
        history: [...commandHistory, completeMoment],
      });
    }
  }
}
