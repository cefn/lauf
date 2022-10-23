import { Store } from "@lauf/store";
import { step } from "@lauf/stepmachine";
import { Narrative, Prompt, Tell, lazyVisitNarrative } from "./narrative";

interface StoryState {
  browsedDesktop: boolean;
  browsedWeb: boolean;
  viewedTodo: boolean;
}

export function initStoryState(): StoryState {
  return {
    browsedDesktop: false,
    browsedWeb: false,
    viewedTodo: false,
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

    yield* lazyVisitNarrative(store, "browsedDesktop", function* () {
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

    const visitedTodo = yield* lazyVisitNarrative(
      store,
      "viewedTodo",
      function* (): Narrative<void> {
        const CHOOSE_TODO = "Click to open TODO.md ?";
        const CHOOSE_BROWSER = "Launch a web browser ?";

        const deskChoice = yield* step(
          prompt,
          "A prominent file labelled TODO.md is visible in the workspace. Will you...",
          [CHOOSE_TODO, CHOOSE_BROWSER]
        );

        if (deskChoice === CHOOSE_TODO) {
          yield* step(
            tell,
            <>
              You click on TODO.md and a text editor pops into view. You read...
              <ul>
                <li>✅ Create @lauf/store state-management for SPAs</li>
                <li>
                  ✅ Design @lauf/stepmachine for flows of async operations
                </li>
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
        }
      }
    );

    if (visitedTodo) {
      continue;
    }

    yield* step(
      tell,
      <>
        Your mouse hovers over a browser icon and clicks. A window swells into
        view, filling the screen. You click on the first hit for 'Interactive
        Fiction forum' with growing excitement. Within minutes you've composed
        your first message and shared it with a global community of creators.
      </>
    );

    break;
  }
}
