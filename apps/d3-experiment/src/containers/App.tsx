import React, { useEffect, useRef } from "react";

import { select } from "d3-selection";

export function App() {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    select(svgRef.current)
      .append("rect")
      .attr("width", 100)
      .attr("height", 100)
      .attr("fill", "blue");
  }, []);

  return (
    <>
      <p>Hello</p>
      <div>
        <svg ref={svgRef} />
      </div>
    </>
  );
}
