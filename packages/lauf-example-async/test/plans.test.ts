import { isDeepStrictEqual } from "util";
import { performSequence, isTermination } from "@lauf/lauf-runner";
import {
  performWithMocks,
  performUntilReactionFulfils,
} from "@lauf/lauf-runner-trial";

import {
  mainPlan,
  FetchSubreddit,
  AppState,
  SubredditName,
  createStore,
} from "../src/plans";
import { Immutable } from "@lauf/lauf-store/types/immutable";

describe("Plans", () => {
  describe("mainPlan() behaviour", () => {
    function createPostsSelector(name: SubredditName) {
      return (state: Immutable<AppState>) => state.caches?.[name]?.posts;
    }

    test("Posts retrieved, stored for initially-focused subreddit: ", async () => {
      const store = createStore();
      const initialFocus = store.getValue().focus;
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

      const testEnding = await performSequence(mainPlan(store), testPerformer);

      //the testPerformer should complete all its steps
      expect(isTermination(testEnding)).toBe(true);
    });

    test("Posts retrieved, stored when focused subreddit changes", async () => {
      const store = createStore();
      const initialFocus = store.getValue().focus;
      const newFocus = "frontend";
      const newFocusPostsSelector = createPostsSelector(newFocus);

      const mockPerformer = () =>
        performWithMocks([
          [new FetchSubreddit(initialFocus), [{ title: "About React" }]],
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
      const testEndingPromise = performSequence(mainPlan(store), testPerformer);

      //change the focused subreddit
      store.editValue((state) => {
        state.focus = newFocus;
      });

      //the testPerformer should complete all its steps
      expect(isTermination(await testEndingPromise)).toBe(true);
    });
  });
});
