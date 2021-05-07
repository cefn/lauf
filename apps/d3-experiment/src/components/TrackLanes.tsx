import React, { useRef, useEffect } from "react";
import { select } from "d3-selection";
import { State } from "../counterPlan";
import { Tracker } from "@lauf/lauf-runner-track";

type TrackLanesProps = {
  tracker: Tracker<State>;
};

export function TrackLanes({ tracker }: TrackLanesProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    select(svgRef.current)
      .append("rect")
      .attr("width", 100)
      .attr("height", 100)
      .attr("fill", "blue");
  }, []);

  return <svg ref={svgRef} />;
}
