import React from "react";
import Head from "next/head";
import styled from "styled-components";

import { useSelected } from "@lauf/lauf-store-react";
import { Rgb, colorStore, selectColor, keyCodeQueue } from "../plan";
import { Immutable } from "@lauf/lauf-store/types/immutable";

const Pane = () => {
  const color: Immutable<Rgb> = useSelected(colorStore, selectColor);
  const [red, green, blue] = color;

  const Box = styled.div`
    width: 100%;
    height: 100px;
    color: rgb(${red}, ${green}, ${blue});
  `;
  return <Box />;
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
