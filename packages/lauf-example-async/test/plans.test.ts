import { isDeepStrictEqual } from "util";
import { Action, directSequence } from "@lauf/lauf-runner";
import {
  actUntilActionMatches,
  actUntilReactionFulfils,
} from "@lauf/lauf-runner-trial";
import { BasicStore } from "@lauf/lauf-store";

import {
  mainPlan,
  FetchSubreddit,
  AppState,
  initialAppState,
} from "../src/plans";

describe("Test domain logic", () => {
  describe("Main plan", () => {
    test("Posts for initially-focused subreddit are retrieved and stored", async () => {
      const store = new BasicStore<AppState>(initialAppState);
      const initialFocus = initialAppState.focus;

      async function* testPerformer(action: Action<any>) {
        yield* actUntilActionMatches(action, new FetchSubreddit(initialFocus));
        const posts = [{ title: "Hey" }, { title: "Yo" }];
        yield* actUntilReactionFulfils(yield posts, (reaction: any) => {
          const maybePosts = store.getValue().caches?.[initialFocus]?.posts;
          return isDeepStrictEqual(posts, maybePosts);
        });
      }

      const mainSequence = mainPlan(store);
      await directSequence(testPerformer, mainSequence);
    });
  });
});
