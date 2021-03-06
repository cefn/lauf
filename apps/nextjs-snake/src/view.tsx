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
  const [{ gameStore, steerQueue }] = useState(() => launchGame());

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
  }, []);

  return (
    <div
      style={{
        display: "inline-block",
        width: GRID_SPAN * TILE_SIDE,
        height: GRID_SPAN * TILE_SIDE,
      }}
    >
      <Head>
        <title>Snake</title>
      </Head>
      {segments.map((_: any, index: number) => (
        <SegmentSprite
          key={index}
          {...{
            segments,
            index,
          }}
        />
      ))}
    </div>
  );
}
