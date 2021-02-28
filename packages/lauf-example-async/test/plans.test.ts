import { isDeepStrictEqual } from "util";
import { Action, directSequence, isTermination } from "@lauf/lauf-runner";
import {
  performWithMocks,
  performUntilReactionFulfils,
} from "@lauf/lauf-runner-trial";
import { BasicStore } from "@lauf/lauf-store";

import {
  mainPlan,
  FetchSubreddit,
  AppState,
  initialAppState,
  SubredditName,
} from "../src/plans";
import { Immutable } from "@lauf/lauf-store/types/immutable";

describe("Plans", () => {
  describe("mainPlan() behaviour", () => {
    function createPostsSelector(name: SubredditName) {
      return (state: Immutable<AppState>) => state.caches?.[name]?.posts;
    }

    test("Posts retrieved, stored for initially-focused subreddit: ", async () => {
      const store = new BasicStore<AppState>(initialAppState);
      const { focus: initialFocus } = initialAppState;
      const focusedPostsSelector = createPostsSelector(initialFocus);

      const mockPerformer = () =>
        performWithMocks([
          [new FetchSubreddit(initialFocus), [{ title: "About React" }]],
        ]);

      const testPerformer = () =>
        performUntilReactionFulfils(
          () =>
            isDeepStrictEqual(focusedPostsSelector(store.getValue()), [
              { title: "About React" },
            ]),
          mockPerformer
        );

      const testEnding = await directSequence(mainPlan(store), testPerformer);

      //the testPerformer should complete all its steps
      expect(isTermination(testEnding)).toBe(true);
    });

    test("Posts retrieved, stored when focused subreddit changes", async () => {
      const store = new BasicStore<AppState>(initialAppState);
      const newFocus = "frontend";
      const newFocusPostsSelector = createPostsSelector(newFocus);

      const mockPerformer = () =>
        performWithMocks([
          [new FetchSubreddit("reactjs"), [{ title: "About React" }]],
          [new FetchSubreddit(newFocus), [{ title: "About Frontend" }]],
        ]);

      const testPerformer = () =>
        performUntilReactionFulfils(
          () =>
            isDeepStrictEqual(newFocusPostsSelector(store.getValue()), [
              { title: "About Frontend" },
            ]),
          mockPerformer
        );

      //launch the plan
      const testEndingPromise = directSequence(mainPlan(store), testPerformer);

      //change the focused subreddit
      store.editValue((state) => {
        state.focus = newFocus;
      });

      //the testPerformer should complete all its steps
      expect(isTermination(await testEndingPromise)).toBe(true);
    });

    //TODO test that a change of focus causes a fetch request.
  });
});
