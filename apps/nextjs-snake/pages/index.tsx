import React from "react";
import Head from "next/head";

import { DirectionName, gameStore, steer } from "../plan";

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
    </>
  );
}
