import React, { useEffect } from "react";
import Head from "next/head";

import { AppModel, Direction, DirectionInput } from "./domain";
import { Arena } from "./components/arena";

const directionMap: Record<string, Direction> = {
  ArrowLeft: "LEFT",
  ArrowUp: "UP",
  ArrowRight: "RIGHT",
  ArrowDown: "DOWN",
} as const;

export function Game({ gameStore, inputQueue }: AppModel) {
  //subscribe to key events, send as DirectionInput
  useEffect(() => {
    if (process.browser) {
      const keyListener = (e: KeyboardEvent) => {
        const { code, type } = e;
        let active = type === "keydown";
        const directionName = directionMap[code];
        if (!directionName) {
          return;
        }
        const directionInput: DirectionInput = [directionName, active];
        inputQueue.send(directionInput);
      };
      document.addEventListener("keydown", keyListener);
      document.addEventListener("keyup", keyListener);
      return () => {
        document.removeEventListener("keydown", keyListener);
        document.removeEventListener("keyup", keyListener);
      };
    }
  }, [inputQueue]);

  return (
    <>
      <style global jsx>{`
        html,
        body,
        div#__next {
          height: auto;
          width: auto;
          border: 0;
          padding: 0;
          margin: 0;
        }
      `}</style>
      <Head>
        <title>Snake</title>
      </Head>
      <Arena {...{ gameStore }} />
    </>
  );
}
