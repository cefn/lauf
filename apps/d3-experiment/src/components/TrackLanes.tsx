import React, { useRef, useEffect } from "react";
import { select } from "d3-selection";
import { State } from "../counterPlan";
import { Tracker } from "@lauf/lauf-runner-track";

type TrackLanesProps = {
  tracker: Tracker<State>;
  awaited: Promise<any>;
};

export function TrackLanes({ tracker, awaited }: TrackLanesProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    (async () => {
      await awaited;
      select(svgRef.current)
        .append("rect")
        .attr("width", 100)
        .attr("height", 100)
        .attr("fill", "blue");
    })();
  }, []);

  return <svg ref={svgRef} />;
}
