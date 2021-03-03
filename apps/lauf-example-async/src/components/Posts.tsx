import React from "react";
import { Post } from "../plans";
import { ImmutableArray } from "@lauf/lauf-store/types/immutable";

type PostsProps = {
  posts: ImmutableArray<Post>;
};

export const Posts = ({ posts }: PostsProps) => (
  <ul>
    {posts.map((post, i) => (
      <li key={i}>{post.title}</li>
    ))}
  </ul>
);
