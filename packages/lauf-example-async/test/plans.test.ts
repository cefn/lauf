import { isDeepStrictEqual } from "util";
import { Action, directSequence, isTermination } from "@lauf/lauf-runner";
import {
  performWithMocks,
  performUntilReactionFulfils,
  createActionMatcher,
} from "@lauf/lauf-runner-trial";
import { BasicStore } from "@lauf/lauf-store";

import {
  mainPlan,
  FetchSubreddit,
  AppState,
  initialAppState,
  fetchPlan,
  SubredditName,
} from "../src/plans";
import { Immutable } from "@lauf/lauf-store/types/immutable";

describe.skip("Plans", () => {
  describe("mainPlan() behaviour", () => {
    const fakePosts = [{ title: "Hey" }, { title: "Yo" }];
    function createPostsSelector(name: SubredditName) {
      return (state: Immutable<AppState>) => state.caches?.[name]?.posts;
    }

    test("Posts retrieved, stored for initially-focused subreddit: ", async () => {
      const store = new BasicStore<AppState>(initialAppState);
      const { focus: initialFocus } = initialAppState;
      const focusedPostsSelector = createPostsSelector(initialFocus);

      const mockPerformer = (action: Action<any>) =>
        performWithMocks(action, [
          [new FetchSubreddit(initialFocus), fakePosts],
        ]);

      const testPerformer = (action: Action<any>) =>
        performUntilReactionFulfils(
          action,
          () => {
            const result = isDeepStrictEqual(
              focusedPostsSelector(store.getValue()),
              fakePosts
            );
            return result;
          },
          mockPerformer
        );

      const testEndingPromise = directSequence(testPerformer, mainPlan(store));

      //the testPerformer should complete all its steps
      expect(isTermination(await testEndingPromise)).toBe(true);
    });

    test("Posts retrieved, stored when focused subreddit changes", async () => {
      const store = new BasicStore<AppState>(initialAppState);
      const { focus: initialFocus } = initialAppState;
      const newFocus = "frontend";
      const newFocusPostsSelector = createPostsSelector(newFocus);

      const mockPerformer = (action: Action<any>) =>
        performWithMocks(action, [
          [new FetchSubreddit(initialFocus), fakePosts],
          [new FetchSubreddit(newFocus), fakePosts],
        ]);

      const testPerformer = (action: Action<any>) =>
        performUntilReactionFulfils(
          action,
          () =>
            isDeepStrictEqual(
              newFocusPostsSelector(store.getValue()),
              fakePosts
            ),
          mockPerformer
        );

      //perform the sequence
      const testEndingPromise = directSequence(testPerformer, mainPlan(store));

      //choose a different subreddit as the focus
      store.editValue((state) => {
        state.focus = newFocus;
      });

      //the testPerformer should complete all its steps
      expect(isTermination(await testEndingPromise)).toBe(true);
    });

    //TODO test that a change of focus causes a fetch request.
  });

  describe("Fetch plan", () => {
    test("", async () => {
      const subredditName = "frontend";
      const store = new BasicStore<AppState>(initialAppState);

      async function* testPerformer(action: Action<any>) {
        //TODO write test
      }

      await directSequence(testPerformer, fetchPlan(store, subredditName));
    });
  });
});
