import React from "react";
import * as d3 from "d3";

import { scaleBand, scaleLinear } from "@visx/scale";

import {
  ForkHandle,
  ForkId,
  StoreEvent,
  Tracker,
} from "@lauf/lauf-runner-track";
import { useSelected } from "@lauf/lauf-store-react";
import { Immutable } from "@lauf/lauf-store/src";

type StoredForkHandle = Immutable<ForkHandle<any, any, any>>;

export function PlanView<AppState>(props: { tracker: Tracker<AppState> }) {
  const {
    tracker: { trackerStore },
  } = props;
  const storeEvents = useSelected(trackerStore, (state) => state.storeEvents);
  const forkHandles = useSelected(trackerStore, (state) => state.forkHandles);
  const forkHandleEntries = Object.entries(forkHandles);

  function* visitForkEvents(forkHandle: StoredForkHandle) {
    yield* forkHandle.actionEvents;
    yield* forkHandle.reactionEvents;
  }

  function* visitChartEvents() {
    for (const [forkId, forkHandle] of Object.entries(forkHandles)) {
      yield* visitForkEvents(forkHandle);
    }
  }

  /** Calculate Chart Dimensions from scoped events*/

  const chartWidth = 800;
  const chartHeight = 800;
  const rowHeight = chartHeight / forkHandleEntries.length;

  /** Calculate time ranges */

  const [earliestTime, latestTime] = d3.extent(
    visitChartEvents(),
    (event) => event.time
  );

  const forkBounds = Object.fromEntries(
    forkHandleEntries.map(([forkId, forkHandle]) => [
      forkId,
      d3.extent(visitForkEvents(forkHandle), (event) => event.time),
    ])
  );

  /** Return placeholder if just 0 or 1 event (no time extent) */
  if (
    earliestTime === undefined ||
    latestTime === undefined ||
    earliestTime === latestTime
  ) {
    return <h1>Awaiting at least two timed events</h1>;
  }

  /** Construct scales */

  const xScale = scaleLinear({
    domain: [earliestTime, latestTime],
    range: [0, chartWidth],
  });

  const yScale = scaleBand({
    domain: Object.keys(forkHandles),
    range: [0, chartHeight],
    padding: 0.1,
  });

  return (
    <>
      <svg
        viewBox={`0 0 ${chartWidth} ${chartHeight}`}
        preserveAspectRatio="xMidYMid meet"
      >
        <rect width="100%" height="100%" style={{ fill: "blue" }} />
        {forkHandleEntries.map(([forkId, forkHandle]) =>
          forkHandle.actionEvents.map((actionEvent, actionPos) => {
            const top = yScale(forkId);
            const left = xScale(actionEvent.time);
            const reactionEvent = forkHandle.reactionEvents[actionPos];
            const right = reactionEvent ? xScale(reactionEvent.time) : left + 1;
            const fill = reactionEvent ? "yellow" : "red";
            return (
              <rect
                x={left}
                y={top}
                width={right - left}
                height={yScale.bandwidth()}
                fill={fill}
                strokeWidth={xScale(1)}
                stroke={"green"}
              ></rect>
            );
          })
        )}
      </svg>
    </>
  );
}
