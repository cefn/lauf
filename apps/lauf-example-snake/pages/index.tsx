import React from "react";
import Head from "next/head";

import { Immutable } from "@lauf/lauf-store";
import { useSelected } from "@lauf/lauf-store-react";

import { Rgb, colorStore, selectColor, keyCodeQueue } from "../plan";

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

export default function () {
  return (
    <div className="container" onKeyDown={(e) => keyCodeQueue.send(e.code)}>
      <Head>
        <title>Snake</title>
      </Head>

      <main>
        <Pane />
      </main>

      <footer></footer>
    </div>
  );
}
