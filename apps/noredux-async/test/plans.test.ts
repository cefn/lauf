import { isDeepStrictEqual } from "util";
import {
  Action,
  Performer,
  ACTOR,
  directSequence,
  isTermination,
  TERMINATE,
} from "@lauf/lauf-runner";
import { actionMatches } from "@lauf/lauf-runner-trial";
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

      const retrievalAction = new FetchSubreddit(initialFocus);
      const retrievedPosts = [{ title: "About React" }];

      const testPerformer: Performer = async (action: Action<any>) => {
        if (actionMatches(action, retrievalAction)) {
          return retrievedPosts;
        } else {
          const reaction = await action.act();
          if (
            isDeepStrictEqual(
              store.select(focusedPostsSelector),
              retrievedPosts
            )
          ) {
            return TERMINATE;
          }
          return reaction;
        }
      };

      const testEnding = await directSequence(mainPlan(store), testPerformer);

      //the testPerformer should complete all its steps
      expect(isTermination(testEnding)).toBe(true);
    }, 30000);

    test("Posts retrieved, stored when focused subreddit changes", async () => {
      const store = new BasicStore<AppState>(initialAppState);
      const newFocus = "frontend";
      const newFocusPostsSelector = createPostsSelector(newFocus);

      const testPerformer: Performer = async (action: Action<any>) => {
        if (actionMatches(action, new FetchSubreddit("reactjs"))) {
          return [{ title: "About React" }];
        } else if (actionMatches(action, new FetchSubreddit(newFocus))) {
          return [{ title: "About Frontend" }];
        } else {
          const reaction = await ACTOR(action);
          if (
            isDeepStrictEqual(store.select(newFocusPostsSelector), [
              { title: "About Frontend" },
            ])
          ) {
            return TERMINATE;
          }
          return reaction;
        }
      };

      //launch the plan
      const testEndingPromise = directSequence(mainPlan(store), testPerformer);

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
