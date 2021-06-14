import React, { FC, useEffect, useState } from "react";
import Head from "next/head";
import { createStore, Store } from "@lauf/store/src";
import { useSelected } from "@lauf/store-react";
import { AppState, INITIAL_STATE, RED, GREEN, BLUE } from "./state";
import { decreaseColor, increaseColor } from "./change";

export const ColorMixer: FC<{ colorStore: Store<AppState> }> = ({
  colorStore
}) => {
  const [red, green, blue] = useSelected(colorStore, (state) => state.color);

  useEffect(() => {
    if (process.browser) {
      const keyListener = ({ code }: KeyboardEvent) => {
        switch (code) {
          case "KeyR":
            increaseColor(colorStore, RED);
            break;
          case "KeyG":
            increaseColor(colorStore, GREEN);
            break;
          case "KeyB":
            increaseColor(colorStore, BLUE);
            break;
          case "KeyE":
            decreaseColor(colorStore, RED);
            break;
          case "KeyF":
            decreaseColor(colorStore, GREEN);
            break;
          case "KeyV":
            decreaseColor(colorStore, BLUE);
            break;
          default:
            break;
        }
      };
      document.addEventListener("keydown", keyListener);
      return () => document.removeEventListener("keydown", keyListener);
    }
    return undefined;
  }, [colorStore]);

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
          display: block;
          margin: 0px;
          padding: 0px;
          border: 0px;
          border-image-width: 0px;
        }
      `}</style>
      <div
        style={{
          fontFamily: "sans-serif",
          color: `rgb(${255 - red},${255 - green},${255 - blue})`
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
};

export function ColorApp() {
  const [colorStore] = useState(() => createStore(INITIAL_STATE));
  return process.browser ? (
    <ColorMixer {...{ colorStore }} />
  ) : (
    <p>Loading...</p>
  );
}
