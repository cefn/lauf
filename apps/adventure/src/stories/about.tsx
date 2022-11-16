import { Store } from "@lauf/store";
import { step } from "@lauf/stepmachine";
import { Narrative, Prompt, Tell, lazyVisitNarrative } from "../lib/narrative";

export interface StoryState {
  hasBrowsedDesktop: boolean;
  hasBrowsedWeb: boolean;
  hasViewedTodo: boolean;
}

export function initStoryState(): StoryState {
  return {
    hasBrowsedDesktop: false,
    hasBrowsedWeb: false,
    hasViewedTodo: false,
  };
}

export function* tellStory(
  store: Store<StoryState>,
  tell: Tell,
  prompt: Prompt
): Narrative<void> {
  for (;;) {
    yield* step(
      tell,
      <>
        You are seated before an illuminated keyboard in a darkened room. A
        screen stands on the desk showing a text cursor flashing between
        quotation marks. It feels like you've been here a very long time.
      </>
    );

    yield* lazyVisitNarrative(store, "hasBrowsedDesktop", function* () {
      yield* step(
        tell,
        <>
          You experiment with the trackpad and mouse button to browse resources
          on the screen. You discover a Typescript API that presents text
          prompts and choices, allowing logical flows to define interactive
          stories. However, there are no stories in the workspace to show how it
          works.
        </>
      );
    });

    if (!store.read().hasViewedTodo) {
      const clickChoice = yield* step(
        prompt,
        <>
          A prominent file labelled TODO.md is visible in the workspace. Will
          you...
        </>,
        {
          name: "web",
          passage: <>Launch a web browser ?</>,
        },
        {
          name: "todo",
          passage: <>Click to open TODO.md ?</>,
        }
      );

      if (clickChoice.name === "todo") {
        yield* step(
          tell,
          <>
            You click on TODO.md and a text editor pops into view. You read...
            <ul>
              <li>✅ Create @lauf/store state-management for SPAs</li>
              <li>✅ Design @lauf/stepmachine for flows of async operations</li>
              <li>
                ✅ Write a simple async engine serving story passages and
                choices
              </li>
              <li>✅ Prove with minimal example</li>
              <li>
                ❌ Identify simple stories from choose-your-path interactive
                fiction tools
              </li>
              <li>❌ Port suitable stories to prove the story engine</li>
            </ul>
          </>
        );
        store.write({
          ...store.read(),
          hasViewedTodo: true,
        });
      }
    }

    yield* lazyVisitNarrative(store, "hasBrowsedWeb", function* () {
      yield* step(
        tell,
        <>
          Your mouse hovers over a browser icon and clicks. A window swells into
          view, filling the screen. You click on the first hit for 'Interactive
          Fiction forum' with growing excitement. Within minutes you've composed
          your first message and shared it with a global community of creators.
        </>
      );
    });

    if (!store.read().hasViewedTodo) {
      // don't let the reader escape until they have seen the TODO file
      yield* step(
        tell,
        <>
          You're left with the feeling that there's something you still have to
          do.
        </>
      );
      continue;
    }

    yield* step(tell, <>The End</>);

    break;
  }
}
