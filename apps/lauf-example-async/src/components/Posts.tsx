import React from "react";
import { Post } from "../plans";
import { ImmutableTuple } from "@lauf/lauf-store";

type PostsProps = {
  posts: ImmutableTuple<Post[]>;
};

export const Posts = ({ posts }: PostsProps) => (
  <ul>
    {posts.map((post, i) => (
      <li key={i}>{post.title}</li>
    ))}
  </ul>
);
