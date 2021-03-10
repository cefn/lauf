import React, { useEffect, useState } from "react";
import Head from "next/head";

import { DirectionName, selectSegments, GRID_SPAN } from "./domain";
import { launchGame } from "./game";
import { useSelected } from "@lauf/lauf-store-react/src";
import { SegmentSprite, TILE_SIDE } from "./components/sprite";

const directionMap: Record<string, DirectionName> = {
  ArrowLeft: "LEFT",
  ArrowUp: "UP",
  ArrowRight: "RIGHT",
  ArrowDown: "DOWN",
} as const;

export function SnakeGame() {
  //launch game logic
  const [{ gameStore, steerQueue }] = useState(() => launchGame());

  //get segments from game state
  const segments = useSelected(gameStore, selectSegments);

  //subscribe to key events
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
  }, []);

  //render the snake
  return (
    <div
      style={{
        display: "block",
        width: GRID_SPAN * TILE_SIDE,
        height: GRID_SPAN * TILE_SIDE,
        backgroundColor: "yellow",
      }}
    >
      <Head>
        <title>Snake</title>
      </Head>
      <style global jsx>{`
        html,
        body,
        div#__next {
          height: 100%;
          width: 100%;
          border: 0;
          padding: 0;
          margin: 0;
        }
      `}</style>
      {segments.map((_: any, index: number) => (
        <SegmentSprite segments={segments} index={index} key={index} />
      ))}
    </div>
  );
}
