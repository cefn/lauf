import { createStore } from "@lauf/store";
import { useSelected } from "@lauf/store-react";
import { Prompt, Tell } from "../tell/narrative";

export interface Reader {
  tell: Tell;
  prompt: Prompt;
  View: () => JSX.Element;
}

export function launchReader(): Reader {
  // lauf store containing a pane (any JSX Element)
  const readerStore = createStore({
    pane: <>Story loading</>,
  });

  // component that watches the pane, re-rendering as it changes
  function View() {
    return <>{useSelected(readerStore, (state) => state.pane)}</>;
  }

  // craft `tell` and `prompt` functions that consume passages and manipulate
  // the pane, yielding promises of 'user input'

  const tell: Tell = (passage) =>
    new Promise((resolve) => {
      readerStore.write({
        pane: (
          <>
            {passage}
            <button onClick={() => resolve()}>Next</button>
          </>
        ),
      });
    });

  const prompt: Prompt = (intro, choices) =>
    new Promise((resolve) => {
      readerStore.write({
        pane: (
          <>
            {intro}
            <ul>
              {choices.map((choice) => (
                <li>
                  <button onClick={() => resolve(choice)}>{choice}</button>
                </li>
              ))}
            </ul>
          </>
        ),
      });
    });

  return {
    tell,
    prompt,
    View,
  };
}
