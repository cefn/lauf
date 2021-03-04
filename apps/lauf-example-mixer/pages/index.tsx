import React from "react";
import Head from "next/head";

import { useSelected } from "@lauf/lauf-store-react";

import { selectColor } from "../domain";
import { colorStore, increaseColor, decreaseColor } from "../plan";

if (process.browser) {
  document.addEventListener("keydown", ({ code }) => {
    switch (code) {
      case "KeyR":
        increaseColor("red");
        break;
      case "KeyG":
        increaseColor("green");
        break;
      case "KeyB":
        increaseColor("blue");
        break;
      case "KeyE":
        decreaseColor("red");
        break;
      case "KeyF":
        decreaseColor("green");
        break;
      case "KeyV":
        decreaseColor("blue");
        break;
    }
  });
}

export default function index() {
  const [red, green, blue] = useSelected(colorStore, selectColor);
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
