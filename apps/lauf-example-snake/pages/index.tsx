import React from "react";
import Head from "next/head";

import { Immutable } from "@lauf/lauf-store";
import { useSelected } from "@lauf/lauf-store-react";

import { Rgb, selectColor } from "../domain";
import { colorStore, colorCommandQueue } from "../plan";

const Pane = () => {
  const color: Immutable<Rgb> = useSelected(colorStore, selectColor);
  const [red, green, blue] = color;
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        backgroundColor: `rgb(${red}, ${green}, ${blue})`,
      }}
    >
      I'm a little teapot{" "}
    </div>
  );
};

export default function index() {
  return (
    <div className="container">
      <Head>
        <title>Snake</title>
      </Head>

      <button onClick={() => colorCommandQueue.send(["red", 1])}>Red</button>

      <main>
        <Pane />
      </main>

      <footer></footer>
    </div>
  );
}
