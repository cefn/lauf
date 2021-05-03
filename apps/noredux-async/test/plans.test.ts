import { isDeepStrictEqual } from "util";
import {
  Performer,
  ACTOR,
  directSequence,
  isTermination,
} from "@lauf/lauf-runner";
import { mockReaction, cutAfterReaction } from "@lauf/lauf-runner-trial";
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

      let testPerformer = ACTOR;
      //mock the fetch
      testPerformer = mockReaction(
        new FetchSubreddit(initialFocus),
        [{ title: "About React" }],
        testPerformer
      );
      //cut when condition reached
      testPerformer = cutAfterReaction(
        () =>
          isDeepStrictEqual(store.select(focusedPostsSelector), [
            { title: "About React" },
          ]),
        testPerformer
      );

      //begin performing
      const testEndingPromise = directSequence(mainPlan(store), testPerformer);

      //performer should eventually reach the cut
      expect(isTermination(await testEndingPromise)).toBe(true);
    }, 30000);

    test("Posts retrieved, stored when focused subreddit changes", async () => {
      const store = new BasicStore<AppState>(initialAppState);
      const newFocus = "frontend";
      const newFocusPostsSelector = createPostsSelector(newFocus);

      let testPerformer: Performer = ACTOR;
      //mock certain actions
      testPerformer = mockReaction(
        new FetchSubreddit("reactjs"),
        [{ title: "About React" }],
        testPerformer
      );
      testPerformer = mockReaction(
        new FetchSubreddit(newFocus),
        [{ title: "About Frontend" }],
        testPerformer
      );
      //cut when condition reached
      testPerformer = cutAfterReaction(
        () =>
          isDeepStrictEqual(store.select(newFocusPostsSelector), [
            { title: "About Frontend" },
          ]),
        testPerformer
      );

      //begin performing
      const testEndingPromise = directSequence(mainPlan(store), testPerformer);

      //trigger change to focused subreddit
      store.edit((state) => {
        state.focus = newFocus;
      });

      //performer should eventually reach the cut
      expect(isTermination(await testEndingPromise)).toBe(true);
    });
  });
});
