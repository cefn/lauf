import { createStore } from "@lauf/store";
import { useSelected } from "@lauf/store-react";
import { Button, Card } from "react-daisyui";
import { Prompt, Tell } from "./narrative";

export interface Reader {
  tell: Tell;
  prompt: Prompt;
  View: () => JSX.Element;
}

export function launchReader(): Reader {
  // watchable value for a pane (any JSX Element)
  const uiStore = createStore({
    pane: <>Story loading</>,
  });

  // component that watches the pane, re-rendering as it changes
  function View() {
    return <>{useSelected(uiStore, (state) => state.pane)}</>;
  }

  // craft `tell` and `prompt` functions that consume passages and manipulate
  // the pane, yielding promises of user input

  const tell: Tell = (passage) =>
    new Promise((resolve) => {
      const page = <div className="flex-grow">{passage}</div>;

      const nextButton = (
        <Button color="primary" onClick={() => resolve()}>
          Next
        </Button>
      );

      const pane = (
        <Card>
          <Card.Body className="h-screen">
            {page}
            <Card.Actions className="justify-end">{nextButton}</Card.Actions>
          </Card.Body>
        </Card>
      );

      uiStore.write({
        pane,
      });
    });

  const prompt: Prompt = (intro, choices) =>
    new Promise((resolve) => {
      const page = <div className="flex-grow">{intro}</div>;

      const buttons = choices.map((choice) => (
        <Button color="secondary" onClick={() => resolve(choice)}>
          {choice}
        </Button>
      ));

      const pane = (
        <Card>
          <Card.Body className="h-screen">
            {page}
            <Card.Actions className="justify-end">{buttons}</Card.Actions>
          </Card.Body>
        </Card>
      );

      uiStore.write({
        pane,
      });
    });

  return {
    tell,
    prompt,
    View,
  };
}
