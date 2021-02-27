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
  fetchPlan,
} from "../src/plans";

describe("Test domain logic", () => {
  describe("Main plan", () => {
    test("Initially-focused subreddit: Posts retrieved and stored", async () => {
      const { focus } = initialAppState;
      const store = new BasicStore<AppState>(initialAppState);

      async function* testPerformer(action: Action<any>) {
        yield* actUntilActionMatches(action, new FetchSubreddit(focus));
        const posts = [{ title: "Hey" }, { title: "Yo" }];
        yield* actUntilReactionFulfils(yield posts, () => {
          const storedPosts = store.getValue().caches?.[focus]?.posts;
          return isDeepStrictEqual(posts, storedPosts);
        });
      }

      await directSequence(testPerformer, mainPlan(store));
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
