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
    test("Check initially focused subreddit is retrieved and stored", async () => {
      const store = new BasicStore<AppState>(initialAppState);
      const initialFocus = initialAppState.focus;

      async function* testPerformer(action: Action<any>) {
        yield* actUntilActionMatches(action, new FetchSubreddit(initialFocus));
        const posts = [{ title: "Hey" }, { title: "Yo" }];
        yield* actUntilReactionFulfils(yield posts, (reaction: any) =>
          isDeepStrictEqual(
            posts,
            store.getValue().caches?.[initialFocus]?.posts
          )
        );
      }

      const mainSequence = mainPlan(store);
      await directSequence(testPerformer, mainSequence);
    });
  });
});
