import React, { useRef, useEffect } from "react";
import { scaleOrdinal, scaleLinear } from "d3-scale";
import { schemeCategory10 } from "d3-scale-chromatic";
import { select } from "d3-selection";
import { State } from "../counterPlan";
import {
  Tracker,
  EventId,
  ActionEvent,
  ReactionEvent,
} from "@lauf/lauf-runner-track";
import { Action } from "@lauf/lauf-runner/src";

type TrackLanesProps = {
  tracker: Tracker<State>;
  awaited: Promise<any>;
};

interface ActionEventLookup {
  [actionOrdinal: number]: ActionEvent<any, any, any>;
}

interface ReactionEventLookup {
  [actionOrdinal: number]: ReactionEvent<any, any, any>;
}

export function TrackLanes({ tracker, awaited }: TrackLanesProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    (async () => {
      if (svgRef.current) {
        await awaited;
        const actionEventLookup: ActionEventLookup = {}; //lookup by Action ordinal
        const reactionEventLookup: ReactionEventLookup = {}; //lookup also by ACTION ordinal
        const { events, forkHandles } = tracker.trackerStore.read();
        if (events.length > 1) {
          const firstEventTime = events[0]!.time;
          const lastEventTime = events[events.length - 1]!.time;
          const duration = lastEventTime - firstEventTime;
          for (const event of events) {
            if (event instanceof ActionEvent) {
              actionEventLookup[event.ordinal] = event;
            } else if (event instanceof ReactionEvent) {
              reactionEventLookup[event.actionEvent.ordinal] = event;
            }
          }
          //draw actions
          const actionEvents = Object.values(actionEventLookup);
          if (actionEvents.length > 0) {
            const svgWidth = 300;
            const svgHeight = 150;
            const rowHeight = svgHeight / Object.values(forkHandles).length;
            const xScale = svgWidth / duration;

            const color = scaleOrdinal(schemeCategory10);
            const yScale = scaleLinear().range([0, svgHeight]);

            select(svgRef.current)
              .selectAll("rect")
              .data(actionEvents)
              .enter()
              .append("rect")
              .attr(
                "x",
                (actionEvent) => (actionEvent.time - firstEventTime) * xScale
              )
              .attr("y", (actionEvent) => yScale(actionEvent.forkHandle.id))
              .attr("width", (actionEvent) => {
                const reactionEvent = reactionEventLookup[actionEvent.ordinal];
                if (reactionEvent) {
                  return (reactionEvent.time - actionEvent.time) * xScale;
                }
                return 1.0;
              })
              .attr("height", rowHeight)
              .attr("fill", (_, i) => color(i.toString()));
          }
        }
      }
    })();
  }, [svgRef.current]);

  return <svg ref={svgRef}></svg>;
}
