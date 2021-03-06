import React, { useEffect, useState } from "react";
import Head from "next/head";
import { useSelected } from "@lauf/lauf-store-react/src";

import { selectColor } from "./domain";
import { launchMixer } from "./plan";

export function ColorMixer() {
  const [{ colorStore, increaseColor, decreaseColor }] = useState(() =>
    launchMixer()
  );

  const [red, green, blue] = useSelected(colorStore, selectColor);

  useEffect(() => {
    if (process.browser) {
      const keyListener = ({ code }: KeyboardEvent) => {
        switch (code) {
          case "KeyR":
            increaseColor("RED");
            break;
          case "KeyG":
            increaseColor("GREEN");
            break;
          case "KeyB":
            increaseColor("BLUE");
            break;
          case "KeyE":
            decreaseColor("RED");
            break;
          case "KeyF":
            decreaseColor("GREEN");
            break;
          case "KeyV":
            decreaseColor("BLUE");
            break;
        }
      };
      document.addEventListener("keydown", keyListener);
      return () => document.removeEventListener("keydown", keyListener);
    }
  }, []);

  return (
    <>
      <Head>
        <title>Color Mixer</title>
      </Head>
      <style global jsx>{`
        html,
        body,
        div#__next {
          height: 100%;
          width: 100%;
          background-color: rgb(${red}, ${green}, ${blue});
        }
      `}</style>
      <div
        style={{
          fontFamily: "sans-serif",
          color: `rgb(${255 - red},${255 - green},${255 - blue})`,
        }}
      >
        <h1>Keyboard Shortcuts</h1>
        <ul>
          <li>Red: +R -E</li>
          <li>Green: +G -F</li>
          <li>Blue: +B -V</li>
        </ul>
      </div>
    </>
  );
}
