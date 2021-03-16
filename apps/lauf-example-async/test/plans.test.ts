import { isDeepStrictEqual } from "util";
import { directSequence, isTermination } from "@lauf/lauf-runner";
import {
  performWithMocks,
  performUntilReactionFulfils,
} from "@lauf/lauf-runner-trial";
import { BasicStore, Immutable } from "@lauf/lauf-store";

import {
  mainPlan,
  FetchSubreddit,
  AppState,
  initialAppState,
  SubredditName,
} from "../src/plans";

describe("Plans", () => {
  describe("mainPlan() behaviour", () => {
    function createPostsSelector(name: SubredditName) {
      return (state: Immutable<AppState>) => state.caches?.[name]?.posts;
    }

    test("Posts retrieved, stored for initially-focused subreddit: ", async () => {
      const store = new BasicStore<AppState>(initialAppState);
      const { focus: initialFocus } = initialAppState;
      const focusedPostsSelector = createPostsSelector(initialFocus);

      const testEnding = await directSequence(
        mainPlan(store),
        performUntilReactionFulfils(
          () =>
            isDeepStrictEqual(focusedPostsSelector(store.read()), [
              { title: "About React" },
            ]),
          performWithMocks([
            [new FetchSubreddit(initialFocus), [{ title: "About React" }]],
          ])
        )
      );

      //the testPerformer should complete all its steps
      expect(isTermination(testEnding)).toBe(true);
    }, 30000);

    test("Posts retrieved, stored when focused subreddit changes", async () => {
      const store = new BasicStore<AppState>(initialAppState);
      const newFocus = "frontend";
      const newFocusPostsSelector = createPostsSelector(newFocus);

      //launch the plan
      const testEndingPromise = directSequence(
        mainPlan(store),
        performUntilReactionFulfils(
          () =>
            isDeepStrictEqual(newFocusPostsSelector(store.read()), [
              { title: "About Frontend" },
            ]),
          performWithMocks([
            [new FetchSubreddit("reactjs"), [{ title: "About React" }]],
            [new FetchSubreddit(newFocus), [{ title: "About Frontend" }]],
          ])
        )
      );

      //change the focused subreddit
      store.edit((state) => {
        state.focus = newFocus;
      });

      //the testPerformer should complete all its steps
      expect(isTermination(await testEndingPromise)).toBe(true);
    });

    //TODO test that a change of focus causes a fetch request.
  });
});
