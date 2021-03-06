import React, { useEffect, useState } from "react";
import Head from "next/head";

import { DirectionName, GRID_DIGITS, selectSegments } from "./domain";
import { launchGame } from "./game";
import { useSelected } from "@lauf/lauf-store-react/src";

const directionMap: Record<string, DirectionName> = {
  ArrowLeft: "LEFT",
  ArrowUp: "UP",
  ArrowRight: "RIGHT",
  ArrowDown: "DOWN",
} as const;

export function SnakeGame() {
  const [{ gameStore, steerQueue }] = useState(launchGame());

  const segments = useSelected(gameStore, selectSegments);

  useEffect(() => {
    if (process.browser) {
      const keyListener = (e: KeyboardEvent) => {
        const { code } = e;
        const directionName = directionMap[code];
        if (directionName) {
          steerQueue.send(directionName);
        }
      };
      document.addEventListener("keydown", keyListener);
      return () => document.removeEventListener("keydown", keyListener);
    }
  });

  return (
    <>
      <Head>
        <title>Snake</title>
      </Head>
      <style global jsx>{`
        html,
        body,
        div#__next {
        }
      `}</style>
      <div style={{ display: "inline-block" }}>
        {GRID_DIGITS.map((y) => (
          <pre
            style={{
              border: "0px",
              padding: "0px",
              margin: "0px",
              fontSize: "3em",
              backgroundColor: "red",
            }}
            key={y}
          >
            {GRID_DIGITS.map((x) => {
              let line = "";
              for (const segment of segments) {
                const [segX, segY] = segment.pos;
                if (segX === x && segY === y) {
                  return "O";
                }
              }
              return " ";
            }).join("")}
          </pre>
        ))}
      </div>
    </>
  );
}
