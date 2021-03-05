import React from "react";
import Head from "next/head";

import { useSelected } from "@lauf/lauf-store-react";
import {
  gridDigits,
  gameStore,
  selectSegments,
  DirectionName,
  steer,
} from "../plan";

const directionMap: Record<string, DirectionName> = {
  ArrowLeft: "left",
  ArrowUp: "up",
  ArrowRight: "right",
  ArrowDown: "down",
} as const;

if (process.browser) {
  document.addEventListener("keydown", ({ code }) => {
    const direction = directionMap[code];
    if (direction) {
      steer(direction);
    }
  });
}

export default function index() {
  const segments = useSelected(gameStore, selectSegments);
  return (
    <>
      <Head>
        <title>Snake</title>
      </Head>
      <style global jsx>{`
        html,
        body,
        div#__next {
          height: 100%;
          width: 100%;
        }
      `}</style>
      {gridDigits.map((y) =>
        gridDigits.map((x) => {
          let line = "";
          for (const segment of segments) {
            const [segX, segY] = segment.pos;
            if (segX === x && segY === y) {
              line += "O";
            }
          }
          line += "&nbsp;";
          return <p>{line}</p>;
        })
      )}
    </>
  );
}
