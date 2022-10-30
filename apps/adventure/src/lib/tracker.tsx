/** Generic inspection */
import inspect from "object-inspect";
import { ObjectInspector } from "react-inspector";

/** Typescript utils */
import { ValueOf } from "../util";
import { nodeRenderer } from "./inspect";

/** Lauf state and stepping */
import { createStore, Immutable, Store } from "@lauf/store";
import { useRootState, useSelected } from "@lauf/store-react";
import { Command, createPerformance } from "@lauf/stepmachine";

/** Narrative story support */
import { StoryState } from "../stories/about";
import { History, IncompleteMoment, initHistory, Moment } from "./history";
import { Narrative, NarrativeOp } from "./narrative";

/** Store containing the complete record of commands and transient states to jog through. */
interface TrackerState {
  history: History<NarrativeOp, StoryState>;
  inspected: {
    label: string;
    value: ValueOf<Moment<NarrativeOp, StoryState>>;
  } | null;
}

/** Launches a story, using a runner that allows inspection of the commanded
 * operations, the returned values and the transient state */
export async function trackStory(
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
    // this will be progressively populated to a complete Moment as the command proceeds
    let commandMoment: Immutable<IncompleteMoment<NarrativeOp, StoryState>>;

    // command yield phase
    {
      const commandResult = await performance.next();
      if (commandResult.done) {
        return commandResult.value;
      }
      const commanded = commandResult.value as Command<NarrativeOp>;
      commandMoment = {
        commanded,
        snapshotBefore: storyStore.read(),
      };
      // record the part-complete moment to history
      trackerStore.patch((state) => ({
        ...state,
        history: [...commandHistory, commandMoment],
      }));
    }

    {
      // returnValue yield phase
      const returnedResult = await performance.next();
      if (returnedResult.done) {
        return returnedResult.value;
      }
      const returned = returnedResult.value as Awaited<ReturnType<NarrativeOp>>;
      // Immutable-safe edit of command moment from previous step
      commandMoment = {
        ...commandMoment,
        returned,
        snapshotAfter: storyStore.read(),
      };
      // record the moment to history
      trackerStore.patch((state) => ({
        ...state,
        history: [...commandHistory, commandMoment],
      }));
    }
  }
}

export function launchTracker(
  storyStore: Store<StoryState>,
  storyPlan: () => Narrative<void>
) {
  const trackerStore = createStore<TrackerState>({
    history: initHistory<NarrativeOp, StoryState>(),
    inspected: null,
  });

  trackStory(trackerStore, storyStore, storyPlan);

  function InspectedView() {
    const inspected = useSelected(trackerStore, ({ inspected }) => inspected);
    return (
      <ObjectInspector
        name={inspected?.label || "Nothing Selected"}
        data={inspected?.value || undefined}
        table={true}
        nodeRenderer={nodeRenderer}
        expandPaths={["$"]}
      />
    );
  }

  function HistoryView() {
    const { history } = useRootState(trackerStore);

    return (
      <table className="table table-fixed text-2xs w-full">
        <thead>
          <tr>
            <th>commanded</th>
            <th>returned</th>
            <th>snapshot</th>
          </tr>
        </thead>
        <tbody>
          {history.map((moment, key) => {
            const { commanded } = moment;
            const tdStyle = { maxWidth: "4em", overflowX: "hidden" } as const;
            return (
              <tr key={key}>
                <td
                  style={tdStyle}
                  onClick={() =>
                    trackerStore.patch((state) => ({
                      ...state,
                      inspected: { label: "Commanded", value: commanded },
                    }))
                  }
                >
                  {inspect(commanded)}
                </td>
                <td
                  style={tdStyle}
                  onClick={() =>
                    trackerStore.patch((state) => ({
                      ...state,
                      inspected: { label: "Returned", value: moment.returned },
                    }))
                  }
                >
                  {JSON.stringify(moment.returned)}
                </td>
                <td
                  style={tdStyle}
                  onClick={() =>
                    trackerStore.patch((state) => ({
                      ...state,
                      inspected: {
                        label: "State",
                        value: moment.snapshotAfter,
                      },
                    }))
                  }
                >
                  {JSON.stringify(moment.snapshotAfter)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    );
  }

  return { HistoryView, InspectedView };
}
