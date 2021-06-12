import { isDeepStrictEqual } from "util";
import { Performer, ACTOR, directSequence } from "@lauf/lauf-runner";
import {
  mockReaction,
  cutAfterReaction,
  ReactionCut,
} from "@lauf/lauf-runner-trial";
import { createStore, Immutable } from "@lauf/lauf-store";

import {
  mainPlan,
  FetchSubreddit,
  AppState,
  initialAppState,
  SubredditName,
} from "../src/plans";
import { Edit } from "@lauf/lauf-runner-primitives/src";

describe("Plans", () => {
  describe("mainPlan() behaviour", () => {
    function createPostsSelector(name: SubredditName) {
      return (state: Immutable<AppState>) => state.caches?.[name]?.posts;
    }

    test("Posts retrieved, stored for initially-focused subreddit: ", async () => {
      const store = createStore<AppState>(initialAppState);
      const { focus: initialFocus } = initialAppState;
      const focusedPostsSelector = createPostsSelector(initialFocus);

      let testPerformer = ACTOR;
      // mock the fetch
      testPerformer = mockReaction(
        new FetchSubreddit(initialFocus),
        [{ title: "About React" }],
        testPerformer
      );
      // cut when condition reached
      testPerformer = cutAfterReaction(
        () =>
          isDeepStrictEqual(store.select(focusedPostsSelector), [
            { title: "About React" },
          ]),
        testPerformer
      );

      //begin performing
      const testEndingPromise = directSequence(mainPlan(store), testPerformer);

      //performer should be cut
      try {
        await testEndingPromise;
      } catch (thrown) {
        expect(thrown).toBeInstanceOf(ReactionCut);
        expect(thrown.action).toBeInstanceOf(Edit);
        expect(thrown.action.store).toBe(store);
      }
    }, 30000);

    test("Posts retrieved, stored when focused subreddit changes", async () => {
      const store = createStore<AppState>(initialAppState);
      const newFocus = "frontend";
      const newFocusPostsSelector = createPostsSelector(newFocus);

      let testPerformer: Performer = ACTOR;
      // mock certain actions
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
      // cut when condition reached
      testPerformer = cutAfterReaction(
        () =>
          isDeepStrictEqual(store.select(newFocusPostsSelector), [
            { title: "About Frontend" },
          ]),
        testPerformer
      );

      // begin performing
      const testEndingPromise = directSequence(mainPlan(store), testPerformer);

      // trigger change to focused subreddit
      store.edit((state) => {
        state.focus = newFocus;
      });

      // performer should cut after editing the store so it fulfils the check
      try {
        await testEndingPromise;
      } catch (thrown) {
        expect(thrown).toBeInstanceOf(ReactionCut);
        expect(thrown.action).toBeInstanceOf(Edit);
        expect(thrown.action.store).toBe(store);
      }
    });
  });
});
