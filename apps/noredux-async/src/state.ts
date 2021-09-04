import { Immutable } from "@lauf/store";

export const subredditNames = ["reactjs", "frontend"] as const;
export type SubredditName = typeof subredditNames[number];

export interface AppState {
  focus: SubredditName;
  caches: {
    [key in SubredditName]?: Cache;
  };
}

export interface Cache {
  isFetching: boolean;
  lastUpdated: number | null; // in milliseconds
  posts: Post[];
}

export interface Post {
  title: string;
}

export const initialAppState: AppState = {
  focus: subredditNames[0],
  caches: {}
} as const;

export const initialCache: Immutable<Cache> = {
  lastUpdated: null,
  isFetching: false,
  posts: []
} as const;
